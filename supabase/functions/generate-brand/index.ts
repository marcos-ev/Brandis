import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { briefing } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing briefing:', briefing.substring(0, 100));

    // Step 1: Analyze briefing and generate brand strategy
    const strategyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a professional brand strategist. Analyze the briefing and return ONLY a valid JSON object with the following structure: {"colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"], "typography": {"primary": "Font Name", "secondary": "Font Name"}, "logoPrompt": "detailed description for logo generation", "mockupPrompts": ["prompt1", "prompt2", "prompt3"]}'
          },
          {
            role: 'user',
            content: `Based on this briefing, create a complete brand strategy:\n\n${briefing}\n\nReturn ONLY the JSON object with colors (5 hex codes), typography (primary and secondary fonts from Google Fonts), logoPrompt (detailed description for AI image generation), and mockupPrompts (3 descriptions for brand mockups).`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!strategyResponse.ok) {
      const errorText = await strategyResponse.text();
      console.error('Strategy generation error:', strategyResponse.status, errorText);
      throw new Error(`Failed to generate strategy: ${strategyResponse.status}`);
    }

    const strategyData = await strategyResponse.json();
    console.log('Strategy response:', strategyData);

    const strategyContent = strategyData.choices[0].message.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let strategy;
    try {
      const jsonMatch = strategyContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strategy = JSON.parse(jsonMatch[0]);
      } else {
        strategy = JSON.parse(strategyContent);
      }
    } catch (e) {
      console.error('Failed to parse strategy JSON:', strategyContent);
      throw new Error('Invalid strategy format from AI');
    }

    console.log('Parsed strategy:', strategy);

    // Step 2: Generate logo image
    const logoResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Create a professional logo: ${strategy.logoPrompt}. Style: modern, clean, minimalist, vectorial. High quality, transparent background if possible.`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!logoResponse.ok) {
      const errorText = await logoResponse.text();
      console.error('Logo generation error:', logoResponse.status, errorText);
      throw new Error(`Failed to generate logo: ${logoResponse.status}`);
    }

    const logoData = await logoResponse.json();
    const logoUrl = logoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!logoUrl) {
      throw new Error('No logo image generated');
    }

    // Step 3: Generate mockups
    const mockupPromises = strategy.mockupPrompts.map(async (prompt: string) => {
      const mockupResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: `Create a professional brand mockup: ${prompt}. High quality, realistic, professional photography style.`
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!mockupResponse.ok) {
        console.error('Mockup generation error:', mockupResponse.status);
        return null;
      }

      const mockupData = await mockupResponse.json();
      return mockupData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    });

    const mockups = (await Promise.all(mockupPromises)).filter(Boolean);

    console.log('Generation complete, returning results');

    return new Response(
      JSON.stringify({
        logo: logoUrl,
        colors: strategy.colors,
        typography: strategy.typography,
        mockups: mockups,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-brand function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
