import numpy as np
import matplotlib.pyplot as plt

def mandelbrot(h, w, maxit=100, x_min=-2.5, x_max=1.0, y_min=-1.5, y_max=1.5):
    """Generate Mandelbrot set image"""
    y, x = np.ogrid[y_min:y_max:h*1j, x_min:x_max:w*1j]
    c = x + y*1j
    z = c
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
fractal = mandelbrot(height, width)
plt.imshow(fractal, extent=[-2.5, 1, -1.5, 1.5], cmap='hot', origin='lower')
plt.title('Mandelbrot Set')
plt.savefig('mandelbrot.png', dpi=150, bbox_inches='tight')
plt.show()

print("Mandelbrot PNG saved as mandelbrot.png")
