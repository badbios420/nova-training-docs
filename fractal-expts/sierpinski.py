import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def sierpinski(n_levels=5, size=500):
    """Generate Sierpinski triangle recursively"""
    fig, ax = plt.subplots()
    ax.set_aspect('equal')
    ax.axis('off')
    
    def draw_triangle(x, y, side, level):
        if level == 0:
            triangle = patches.Polygon([[x, y], [x + side, y], [x + side/2, y + side * np.sqrt(3)/2]], 
                                     closed=True, facecolor='black')
            ax.add_patch(triangle)
        else:
            side3 = side / 3
            draw_triangle(x, y, side3, level-1)
            draw_triangle(x + side3, y, side3, level-1)
            draw_triangle(x + side3/2, y + side3 * np.sqrt(3)/2, side3, level-1)
    
    draw_triangle(0, 0, size, n_levels)
    plt.xlim(0, size)
    plt.ylim(0, size * np.sqrt(3)/2)
    plt.title('Sierpinski Triangle')
    plt.savefig('sierpinski.png', dpi=150, bbox_inches='tight')
    plt.show()

sierpinski()
print("Sierpinski PNG saved as sierpinski.png")
