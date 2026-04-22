import onnxruntime as ort
import numpy as np
import cv2

# Load the ONNX version of YOLO26
session = ort.InferenceSession("models/yolo26n-cls.onnx")

def classify_image(path):
    # 1. Image Preprocessing
    img = cv2.imread(path)
    if img is None:
        return "General Waste"
    
    # Keeping a copy for secondary analysis
    original_copy = img.copy()
    
    img = cv2.resize(img, (224, 224))
    img = img.astype(np.float32) / 255.0
    
    # Normalization (This is the 'Instruction' for the model to see edges)
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img = (img - mean) / std
    
    img = img.transpose(2, 0, 1) # HWC to CHW
    img = np.expand_dims(img, axis=0).astype(np.float32)

    # 2. ONNX Inference
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: img})
    
    # Softmax to get Confidence %
    def softmax(x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum()

    scores = softmax(outputs[0][0])
    class_id = np.argmax(scores)
    confidence = scores[class_id]
    
    # 3. Category Mapping
    categories = ["E-Waste", "Bio-Medical", "Sanitary", "Plastic", "Paper"]
    label = categories[class_id] if class_id < len(categories) else "General Waste"

    # --- 🟢 THE "LOGIC PROMPT" (Offline Overrides) ---
    
    # Rule 1: Red Color Detection (Mimics "Look for Bio-hazard bags")
    hsv = cv2.cvtColor(original_copy, cv2.COLOR_BGR2HSV)
    # Mask for red (International Bio-Medical waste color)
    mask1 = cv2.inRange(hsv, (0, 70, 50), (10, 255, 255))
    mask2 = cv2.inRange(hsv, (170, 70, 50), (180, 255, 255))
    red_ratio = np.count_nonzero(mask1 | mask2) / (original_copy.shape[0] * original_copy.shape[1])

    # Rule 2: Confidence Check (Mimics "If you aren't sure, don't guess General")
    print(f"🔍 AI Prediction: {label} | Confidence: {confidence:.2f}")
    
    # If the model sees red and isn't 100% sure about "General", force Bio-Medical
    if red_ratio > 0.10 and label == "General Waste":
        print("⚠️ Override: Red color detected (Hazardous Bag). Re-classifying...")
        return "Bio-Medical"

    # Rule 3: Handling Uncertainty
    if confidence < 0.25:
        return "Unknown (Potential Hazard)"

    return label