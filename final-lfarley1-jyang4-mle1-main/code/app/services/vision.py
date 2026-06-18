import os
import base64
import json
from openai import OpenAI

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    
def load_prompt():
    prompt_one = ""
    # read the file that corresponds to the mode of operation
    instructions = open("app/services/prompts/identify_food_prompt.txt", 'r')
    #concatenate files
    prompt_one += instructions.read()
    instructions.close()
    
    return prompt_one

def identify_food(image_path):
    client = OpenAI()
    
    image = encode_image(image_path)

    prompt = load_prompt()
    
    response = client.responses.create(
        model="gpt-5.1",
        input=[
            {
                "role": "user",
                "content": [
                    { "type": "input_text", "text": prompt },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{image}",
                    },
                ],
            }
        ],
    )
    
    data = json.loads(response.output_text)
    
    return data
    