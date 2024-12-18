# import modal
# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# from io import BytesIO
# from fastapi.responses import StreamingResponse
# import os

# app = modal.App("stable-diffusion")
# web_app = FastAPI()

# # Allow CORS from specific origins (e.g., your frontend server)
# web_app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Adjust this to the URL of your Next.js app
#     allow_credentials=True,
#     allow_methods=["*"],  
#     allow_headers=["*"],  
# )

# class Prompt(BaseModel):
#     text: str

# @web_app.post("/generate")
# def run_stable_diffusion(req: Prompt):
#     from diffusers import StableDiffusion3Pipeline
#     # from diffusers import BitsAndBytesConfig, SD3Transformer2DModel
#     import torch
    
#     # diffuser model id
#     model_id = "stabilityai/stable-diffusion-3.5-large"

#     # # 4-bit quantization config
#     # nf4_config = BitsAndBytesConfig(
#     #     load_in_4bit=True,
#     #     bnb_4bit_quant_type="nf4",
#     #     bnb_4bit_compute_dtype=torch.bfloat16
#     # )

#     # # transofrmer model
#     # model_nf4 = SD3Transformer2DModel.from_pretrained(
#     #     model_id,
#     #     subfolder="transformer",
#     #     quantization_config=nf4_config,
#     #     torch_dtype=torch.bfloat16
#     # )

#     # pipeline for diffusion model
#     pipeline = StableDiffusion3Pipeline.from_pretrained(
#         model_id,
#         # transformer_model=model_nf4,
#         torch_dtype=torch.bfloat16,
#         use_auth_token=os.environ["HF_TOKEN"],
#     ).to("cuda")

#     # enable cpu offload
#     # pipeline.enable_model_cpu_offload()

#     # extract prompt from request
#     prompt = req.text

#     # generate image
#     image = pipeline(prompt, num_inference_steps=28, guidance_scale=3.5).images[0]

#     # convert image to bytes
#     buf = BytesIO()
#     image.save(buf, format="PNG")
#     img_bytes = buf.getvalue()

#     # return image as streaming response
#     return StreamingResponse(BytesIO(img_bytes), media_type="image/png")

# image = (
#     modal.Image.debian_slim(python_version="3.12")
#     .pip_install(
#         "accelerate==0.33.0",
#         "diffusers==0.31.0",
#         "fastapi[standard]==0.115.4",
#         "huggingface-hub[hf_transfer]==0.25.2",
#         "sentencepiece==0.2.0",
#         "torch==2.5.1",
#         "torchvision==0.20.1",
#         "transformers~=4.44.0",
#     ))
# with image.imports:

# @app.function(
#         image=image,
#         secrets=[modal.Secret.from_name("huggingface-secret")],
#         gpu="A10G")
# @modal.asgi_app()
# def fastapi_app():
#     return web_app

# # @app.local_entrypoint()
# # def main():
# #     img_bytes = run_stable_diffusion.remote("Wu-Tang Clan climbing Mount Everest")
# #     with open("/tmp/output.png", "wb") as f:
# #         f.write(img_bytes)
# #     return img_bytes

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from fastapi.responses import StreamingResponse
import os
from PIL import Image
from dotenv import load_dotenv
import random

load_dotenv()

app = FastAPI()

# Allow CORS from specific origins (e.g., your frontend server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to the URL of your Next.js app
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class Prompt(BaseModel):
    text: str

@app.post("/test")
def generate_random_image(req: Prompt):
    colors = ["red", "green", "blue", "yellow", "purple", "orange"]
    random_color = random.choice(colors)
    img = Image.new("RGB", (100, 100), color=random_color)
 
    # Save the image to a BytesIO object
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    return StreamingResponse(img_byte_arr, media_type="image/png")


if __name__ == '__main__':
    import uvicorn
    print('token:', os.getenv("HF_TOKEN"))
    uvicorn.run(app, host="127.0.0.1", port=10000)