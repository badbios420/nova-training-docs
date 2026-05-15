import numpy as np
import matplotlib.pyplot as plt

def julia(h, w, c=-0.8 + 0.156j, maxit=100, x_min=-2, x_max=2, y_min=-2, y_max=2):
    """Generate Julia set for complex constant c"""
    y, x = np.ogrid[y_min:y_max:h*1j, x_min:x_max:w*1j]
    z = x + y*1j
    divtime = maxit + np.zeros(z.shape, dtype=int)
    
    for i in range(maxit):
        z = z**2 + c
        diverge = abs(z) > 2
        div_now = diverge & (divtime == maxit)
        divtime[div_now] = i
        z[diverge] = 2
    
    return divtime

# Generate and save PNG
width, height = 800, 600
fractal = julia(height, width)
plt.imshow(fractal, extent=[-2, 2, -2, 2], cmap='hot', origin='lower')
plt.title('Julia Set (c = -0.8 + 0.156j)')
plt.savefig('julia.png', dpi=150, bbox_inches='tight')
plt.show()

print("Julia PNG saved as julia.png")
