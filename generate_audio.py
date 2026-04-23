# To run this code you need to install the following dependencies:
# pip install google-genai

import mimetypes
import os
import re
import struct
from google import genai
from google.genai import types


def save_binary_file(file_name, data):
    f = open(file_name, "wb")
    f.write(data)
    f.close()
    print(f"File saved to to: {file_name}")


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-pro-preview-tts"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""Read aloud in a warm and friendly tone: 
**मैं माफी चाहता हूँ, लेकिन यह स्क्रिप्ट नहीं लिख सकता।**

आपके बताए टॉपिक — “RAW के एक सीक्रेट एजेंट ने 1971 वॉर से पहले पाकिस्तान के न्यूक्लियर प्रोग्राम में घुसपैठ की थी” — किसी भी पब्लिक, डीक्लासिफाइड या डॉक्यूमेंटेड इतिहास में मौजूद नहीं है।  

पाकिस्तान का न्यूक्लियर वेपन्स प्रोग्राम (Project-706) 1971 की हार के बाद 1972 में ही शुरू हुआ था। RAW की किसी भी ऑपरेशन या एजेंट (Ravindra Kaushik, Kahuta ट्रैकिंग आदि) की पहली गतिविधियाँ 1975 के बाद की हैं। 1971 से पहले ऐसा कोई इंसिडेंट डीक्लासिफाइड रिकॉर्ड्स, किताबों (B. Raman, RAW ऑफिसर्स) या विश्वसनीय सोर्स में नहीं मिलता।

एक “documentary-style” स्क्रिप्ट में गलत ऐतिहासिक घटना को सच की तरह पेश करना गलत होगा। इसलिए मैं इस आधार पर कोई स्क्रिप्ट नहीं लिख सकता।

अगर आप चाहें तो **असली घटना** पर स्क्रिप्ट लिख सकता हूँ — उदाहरण के लिए आपके पहले टॉपिक पर:  
“1971 Indo-Pak war के दौरान RAW एजेंट की East Pakistan में infiltration”  
या कोई और रियल इंसिडेंट (Kargil warning ignored, 26/11 ignored intelligence, IC-814 आदि)।

बताइए, कौन सा रियल टॉपिक पर 2 मिनट का सस्पेंसफुल डॉक्यूमेंट्री स्क्रिप्ट चाहिए? मैं तुरंत लिख दूँगा — 100% फैक्ट-बेस्ड और वायरल स्टाइल में।"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        response_modalities=[
            "audio",
        ],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Algieba"
                )
            )
        ),
    )

    file_index = 0
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.parts is None
        ):
            continue
        if chunk.parts[0].inline_data and chunk.parts[0].inline_data.data:
            file_name = f"ENTER_FILE_NAME_{file_index}"
            file_index += 1
            inline_data = chunk.parts[0].inline_data
            data_buffer = inline_data.data
            file_extension = mimetypes.guess_extension(inline_data.mime_type)
            if file_extension is None:
                file_extension = ".wav"
                data_buffer = convert_to_wav(inline_data.data, inline_data.mime_type)
            save_binary_file(f"{file_name}{file_extension}", data_buffer)
        else:
            print(chunk.text)

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    """Generates a WAV file header for the given audio data and parameters.

    Args:
        audio_data: The raw audio data as a bytes object.
        mime_type: Mime type of the audio data.

    Returns:
        A bytes object representing the WAV file header.
    """
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size  # 36 bytes for header fields before data chunk size

    # http://soundfile.sapp.org/doc/WaveFormat/

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",          # ChunkID
        chunk_size,       # ChunkSize (total file size - 8 bytes)
        b"WAVE",          # Format
        b"fmt ",          # Subchunk1ID
        16,               # Subchunk1Size (16 for PCM)
        1,                # AudioFormat (1 for PCM)
        num_channels,     # NumChannels
        sample_rate,      # SampleRate
        byte_rate,        # ByteRate
        block_align,      # BlockAlign
        bits_per_sample,  # BitsPerSample
        b"data",          # Subchunk2ID
        data_size         # Subchunk2Size (size of audio data)
    )
    return header + audio_data

def parse_audio_mime_type(mime_type: str) -> dict[str, int | None]:
    """Parses bits per sample and rate from an audio MIME type string.

    Assumes bits per sample is encoded like "L16" and rate as "rate=xxxxx".

    Args:
        mime_type: The audio MIME type string (e.g., "audio/L16;rate=24000").

    Returns:
        A dictionary with "bits_per_sample" and "rate" keys. Values will be
        integers if found, otherwise None.
    """
    bits_per_sample = 16
    rate = 24000

    # Extract rate from parameters
    parts = mime_type.split(";")
    for param in parts: # Skip the main type part
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate_str = param.split("=", 1)[1]
                rate = int(rate_str)
            except (ValueError, IndexError):
                # Handle cases like "rate=" with no value or non-integer value
                pass # Keep rate as default
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except (ValueError, IndexError):
                pass # Keep bits_per_sample as default if conversion fails

    return {"bits_per_sample": bits_per_sample, "rate": rate}


if __name__ == "__main__":
    generate()
