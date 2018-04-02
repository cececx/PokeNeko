import sys
from PIL import Image

name = '{}-{}.jpg'
act = 'jump'
n = 2

images = map(Image.open, [name.format(act, i) for i in range(n)])
w, h = zip(*(i.size for i in images))

w_sum = sum(w)
h_max = max(h)

new_img = Image.new('RGB', (w_sum, h_max))

x_offset = 0
for img in images:
  new_img.paste(img, (x_offset, 0))
  x_offset += img.size[0]
  
new_img.save('{}.jpg'.format(act))