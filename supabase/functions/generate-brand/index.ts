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

    // Step 2: Generate multiple logo variations with brand consistency
    const logoPromises = Array.from({ length: variationsCount }, async (_, index) => {
      // Create enhanced logo prompt with brand colors
      const brandColors = strategy.colors.join(', ');
      const enhancedLogoPrompt = `${strategy.logoPrompt}. 
      Brand Colors: ${brandColors}. 
      Use these exact colors in the logo design.`;
      
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
              content: `Create a professional logo variation ${index + 1}: ${enhancedLogoPrompt}. 
              Style: modern, clean, minimalist, vectorial. 
              High quality, transparent background if possible. 
              Make this version unique and different from other variations while maintaining brand consistency. 
              Use the specified brand colors throughout the design.`
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!logoResponse.ok) {
        console.error('Logo generation error:', logoResponse.status);
        return null;
      }

      const logoData = await logoResponse.json();
      return logoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    });

    const logos = (await Promise.all(logoPromises)).filter(Boolean);

    if (logos.length === 0) {
      throw new Error('No logo images generated');
    }

    // Step 3: Generate multiple mockup variations with brand consistency
    const mockupPromises = strategy.mockupPrompts.flatMap((prompt: string) =>
      Array.from({ length: variationsCount }, async (_, index) => {
        // Create enhanced prompt with brand colors and typography
        const brandColors = strategy.colors.join(', ');
        const primaryFont = strategy.typography.primary;
        const secondaryFont = strategy.typography.secondary;
        
        const enhancedPrompt = `${prompt}. 
        Brand Colors: ${brandColors}. 
        Typography: Primary font "${primaryFont}", Secondary font "${secondaryFont}". 
        Apply these exact colors and fonts consistently throughout the mockup. 
        Ensure visual harmony between logo, colors, and typography.`;
        
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
                content: `Create a professional brand mockup variation ${index + 1}: ${enhancedPrompt}. 
                High quality, realistic, professional photography style. 
                Make this version unique while maintaining brand consistency. 
                Use the specified colors and typography throughout the design.`
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
      })
    );

    const mockups = (await Promise.all(mockupPromises)).filter(Boolean);

    console.log('Generation complete, returning results');

    return new Response(
      JSON.stringify({
        logos: logos,
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
