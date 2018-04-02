import sys
from PIL import Image

try:
  act = sys.argv[1]
  n = int(sys.argv[2])
except:
  print '  ERROR: Invalid Argument'
  print '  Please use: merge_img <action_name> <frame_count>'
  exit()

name = '{}-{}.jpg'

images = map(Image.open, [name.format(act, i) for i in range(n)])
w, h = zip(*(i.size for i in images))
w_sum = sum(w)
h_max = max(h)
new_img = Image.new('RGB', (w_sum, h_max))

offset = 0
for img in images:
  new_img.paste(img, (offset, 0))
  offset += img.size[0]

out = '{}.jpg'.format(act)
new_img.save(out)

print '  File save: ' + out