import PIL.Image as Image

img = Image.open('C:/Users/Akshat/.gemini/antigravity-ide/brain/ee68f078-d524-4f05-9956-e543cbb5b029/media__1781519067415.png')
w, h = img.size

# Let's inspect Column 1 (x = 100) from y = 0 to y = h
x = 100
col_colors = [img.getpixel((x, y)) for y in range(h)]

# Print color transitions to find where the card image starts and ends
transitions = []
for y in range(1, h):
    c1 = col_colors[y-1]
    c2 = col_colors[y]
    diff = sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
    if diff > 20:
        transitions.append((y, c1[:3], c2[:3]))

print("Vertical color transitions at x=100:")
for t in transitions:
    print(f"y={t[0]}: {t[1]} -> {t[2]}")
