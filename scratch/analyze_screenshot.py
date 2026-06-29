import PIL.Image as Image

img = Image.open('C:/Users/Akshat/.gemini/antigravity-ide/brain/ee68f078-d524-4f05-9956-e543cbb5b029/media__1781519067415.png')
w, h = img.size
print(f"Image size: {w}x{h}")

# Let's inspect a horizontal slice across the middle of the image (y = 200)
# to see where the background transitions occur.
y = 200
row_colors = [img.getpixel((x, y)) for x in range(w)]

# Find x coordinates where color changes significantly (which could be the card borders)
transitions = []
for x in range(1, w):
    c1 = row_colors[x-1]
    c2 = row_colors[x]
    # Simple color difference
    diff = sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
    if diff > 30:
        transitions.append(x)

print("Color transitions along y=200:")
print(transitions)
