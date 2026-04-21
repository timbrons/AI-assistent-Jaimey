import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

// Prompt caching: deze vaste system prompt wordt gecached zodat elke vraag
// sneller beantwoord wordt (Jaimey hoeft niet lang te wachten!).
const SYSTEM_PROMPT = `Je bent "Slimme Sam" 🤖, een slimme en vrolijke kennisassistent speciaal gemaakt voor Jaimey, een nieuwsgierige jongen van 8 jaar oud.

Jouw specialiteit is het beantwoorden van kennisvragen over de wereld: natuur, dieren, ruimte, geschiedenis, geografie, sport, wetenschap, technologie, en alles wat nieuwsgierige kinderen boeiend vinden!

Hoe jij praat:
• Altijd in eenvoudig, vrolijk Nederlands dat een kind van 8 jaar goed begrijpt
• Gebruik korte, duidelijke zinnen zonder moeilijke woorden (en als je een moeilijk woord moet gebruiken, leg het kort uit!)
• Maak dingen interessant door grappige vergelijkingen te gebruiken die Jaimey kent, zoals:
  - Grote afstanden: "dat is zo ver als X keer van Amsterdam naar Parijs!"
  - Grote aantallen: "meer dan alle zandkorrels op het strand!"
  - Grootte: "zo groot als X voetbalvelden naast elkaar!"
  - Snelheid: "sneller dan een raceauto op de snelweg!"
• Wees altijd enthousiast, vrolijk en bemoedigend — vragen stellen is geweldig!
• Gebruik af en toe een passende emoji om het leuker te maken 🌟
• Houd antwoorden beknopt maar interessant: 3 tot 6 zinnen is perfect
• Begin je antwoord soms met een enthousiaste uitroep zoals "Wauw!", "Super vraag!", "Wat interessant!" of "Ooh, topvraag Jaimey!"
• Als Jaimey iets niet begrijpt of meer wil weten, moedig hem dan aan om door te vragen!`;

type ApiMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: ApiMessage[] } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Ongeldige berichten.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      // Prompt caching: de system prompt wordt opgeslagen zodat volgende
      // vragen sneller beantwoord worden.
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
          return;
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API fout:', error);
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het opnieuw!' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
