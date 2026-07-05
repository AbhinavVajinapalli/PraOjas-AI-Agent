import sys
from rembg import remove
from PIL import Image
import os

def process_logo(input_path, output_path, crop_left_half=False):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    with open(input_path, 'rb') as i:
        input_data = i.read()
    
    # Remove background
    output_data = remove(input_data)
    
    # Save temporarily
    temp_path = output_path + ".temp.png"
    with open(temp_path, 'wb') as o:
        o.write(output_data)
        
    img = Image.open(temp_path)
    
    if crop_left_half:
        # Crop the left half (assuming it's a wide image and the icon is on the left)
        width, height = img.size
        # Crop a square from the left side
        img = img.crop((0, 0, height, height))
        
    img.save(output_path, "PNG")
    os.remove(temp_path)
    print(f"Processed {output_path}")

process_logo('Logos/PraOjas logo 1.jpg', 'frontend/public/logo-1.png')
process_logo('Logos/PraOjas logo 2.jpg', 'frontend/public/logo-2.png')
process_logo('Logos/PraOjas logo 3.jpg', 'frontend/public/logo-3.png', crop_left_half=True)
