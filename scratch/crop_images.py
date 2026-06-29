import PIL.Image as Image

# Load the source screenshot
img = Image.open('C:/Users/Akshat/.gemini/antigravity-ide/brain/ee68f078-d524-4f05-9956-e543cbb5b029/media__1781519067415.png')

# Bounding boxes for the four cards
# x from start to end, y from 91 to 320
crops = [
    ("sachets_pack30.png", (29, 91, 259, 320)),
    ("sachets_nutty_crush.png", (269, 91, 499, 320)),
    ("sachets_pistachio_combo.png", (509, 91, 739, 320)),
    ("sachets_pre_workout.png", (749, 91, 979, 320))
]

dst_dir = 'c:/Users/Akshat/Impulse Coffee/src/assets/'

for filename, box in crops:
    cropped = img.crop(box)
    cropped.save(dst_dir + filename)
    print(f"Saved {filename} with size {cropped.size}")
