from ultralytics import YOLO
import os
import shutil

# 1. Download the latest Nano model (it's very small and fast)
print("Downloading YOLO model...")
model = YOLO("yolo26n-cls.pt") 

# 2. Export it to ONNX format (optimized for your i5 CPU)
print("Exporting to ONNX... this may take a minute.")
model.export(format="onnx", imgsz=224)

# 3. Ensure the models folder exists
if not os.path.exists("models"):
    os.makedirs("models")

# 4. Move the exported file to your models folder
if os.path.exists("yolo26n-cls.onnx"):
    shutil.move("yolo26n-cls.onnx", "models/yolo26n-cls.onnx")
    print("✅ Success! YOLO ONNX model is ready in models/ folder.")
else:
    print("❌ Error: ONNX file was not created.")