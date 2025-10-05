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
    const { briefing, variationsCount = 1 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing briefing:', briefing.substring(0, 100), 'Variations:', variationsCount);

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
            content: 'You are a professional brand strategist. Analyze the briefing and create a cohesive brand identity. Return ONLY a valid JSON object with the following structure: {"colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"], "typography": {"primary": "Font Name", "secondary": "Font Name"}, "logoPrompt": "detailed description for logo generation", "mockupPrompts": ["prompt1", "prompt2", "prompt3"]}. Ensure colors are harmonious, fonts are complementary, and mockup prompts describe realistic applications that will showcase the brand consistently.'
          },
          {
            role: 'user',
            content: `Based on this briefing, create a complete brand strategy:\n\n${briefing}\n\nReturn ONLY the JSON object with:
            - colors: 5 harmonious hex codes that work well together
            - typography: primary and secondary fonts from Google Fonts that complement each other
            - logoPrompt: detailed description for AI image generation including style, colors, and elements
            - mockupPrompts: 3 realistic mockup descriptions (e.g., "business card with logo and contact info", "website header with navigation", "product packaging") that will showcase the brand consistently using the same colors and typography.`
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

    // Step 2: Generate logo
    console.log('Generating logo...');
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
            content: `Create a professional logo: ${strategy.logoPrompt}. 
            Brand Colors: ${strategy.colors.join(', ')}. 
            Style: modern, clean, minimalist, vectorial. 
            High quality, transparent background if possible.`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!logoResponse.ok) {
      const errorText = await logoResponse.text();
      console.error('Logo generation error:', logoResponse.status, errorText);
      throw new Error('Failed to generate logo');
    }

    const logoData = await logoResponse.json();
    const logoUrl = logoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!logoUrl) {
      throw new Error('No logo URL in response');
    }

    console.log('Logo generated successfully');

    // Step 3: Generate mockups using the actual logo
    console.log('Starting mockup generation with actual logo...');
    const mockupPrompts = strategy.mockupPrompts || [
      'Business card with logo and contact information on a wooden desk',
      'Website homepage mockup on laptop screen showing the brand',
      'Product packaging box with brand logo and colors'
    ];

    const mockups: string[] = [];

    for (let i = 0; i < mockupPrompts.length; i++) {
      try {
        console.log(`Generating mockup ${i + 1}/${mockupPrompts.length}: ${mockupPrompts[i]}`);
        
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
                content: [
                  {
                    type: 'text',
                    text: `Create a professional brand mockup: ${mockupPrompts[i]}. 
                    Use THIS EXACT LOGO image in the mockup (provided below).
                    Brand Colors: ${strategy.colors.join(', ')}. 
                    Typography: Primary font "${strategy.typography.primary}", Secondary font "${strategy.typography.secondary}". 
                    High quality, realistic, professional photography style. 
                    IMPORTANT: Place the provided logo prominently in the mockup design.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: logoUrl
                    }
                  }
                ]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!mockupResponse.ok) {
          const errorText = await mockupResponse.text();
          console.error(`Mockup ${i + 1} generation error:`, mockupResponse.status, errorText);
          continue;
        }

        const mockupData = await mockupResponse.json();
        const mockupUrl = mockupData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (mockupUrl) {
          mockups.push(mockupUrl);
          console.log(`Mockup ${i + 1} generated successfully with logo integration`);
        } else {
          console.error(`Mockup ${i + 1}: No URL in response`);
        }
      } catch (error) {
        console.error(`Error generating mockup ${i + 1}:`, error);
      }
    }

    console.log(`Total mockups generated: ${mockups.length}`);

    console.log('Generation complete, returning results');

    return new Response(
      JSON.stringify({
        logos: [logoUrl],
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
