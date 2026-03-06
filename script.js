// A comprehensive list of typical Winton Oil Colors (Approximated RGB values)
const wintonColors = [
    { name: "Titanium White", hex: "#FFFFFF" },
    { name: "Zinc White", hex: "#F4F7F6" },
    { name: "Lemon Yellow Hue", hex: "#FCE73A" },
    { name: "Cadmium Yellow Pale Hue", hex: "#FAD610" },
    { name: "Cadmium Yellow Hue", hex: "#F9B612" },
    { name: "Cadmium Orange Hue", hex: "#F37022" },
    { name: "Cadmium Red Light Hue", hex: "#E93F33" },
    { name: "Cadmium Red Deep Hue", hex: "#C62127" },
    { name: "Alizarin Crimson Hue", hex: "#9E1B32" },
    { name: "Magenta", hex: "#C61F58" },
    { name: "French Ultramarine", hex: "#1D3263" },
    { name: "Phthalo Blue", hex: "#003A6D" },
    { name: "Cerulean Blue Hue", hex: "#0072B5" },
    { name: "Viridian Hue", hex: "#006C59" },
    { name: "Phthalo Green", hex: "#00563F" },
    { name: "Sap Green", hex: "#4A5D23" },
    { name: "Yellow Ochre", hex: "#C79342" },
    { name: "Burnt Sienna", hex: "#7E3A27" },
    { name: "Burnt Umber", hex: "#3A2B24" },
    { name: "Ivory Black", hex: "#232323" },
];

/* --- MIXER MODE VARIABLES --- */
const colorsGrid = document.getElementById('colors-grid');
const selectedColorsContainer = document.getElementById('selected-colors');
const mixedColorPreview = document.getElementById('mixed-color-preview');
const hexDisplay = document.getElementById('hexDisplay');
const rgbDisplay = document.getElementById('rgbDisplay');
const compositionDisplay = document.getElementById('compositionDisplay');
const resetBtn = document.getElementById('reset-btn');

let currentMix = [];

/* --- MATCHER MODE VARIABLES --- */
// Tabs
const tabColorPicker = document.getElementById('tab-color-picker');
const tabImageUpload = document.getElementById('tab-image-upload');
const viewColorPicker = document.getElementById('view-color-picker');
const viewImageUpload = document.getElementById('view-image-upload');

// Manual Picker
const targetColorPicker = document.getElementById('target-color-picker');
const targetColorPreview = document.getElementById('target-color-preview');

// Image upload / canvas
const uploadZone = document.getElementById('upload-zone');
const imageInput = document.getElementById('image-input');
const canvasContainer = document.getElementById('canvas-container');
const imageCanvas = document.getElementById('image-canvas');
const ctx = imageCanvas.getContext('2d', { willReadFrequently: true });
const eyedropperPreview = document.getElementById('eyedropper-preview');
const newImageBtn = document.getElementById('new-image-btn');

// Common Matcher UI
const targetHexDisplay = document.getElementById('target-hex');
const selectedColorThumb = document.getElementById('selected-color-thumb');
const findMatchBtn = document.getElementById('find-match-btn');
const recipeContainer = document.getElementById('recipe-container');

// State
let currentlySelectedHexTarget = "#4A90E2"; // Default

/* --- NAVIGATION --- */
const btnModeMixer = document.getElementById('btn-mode-mixer');
const btnModeMatcher = document.getElementById('btn-mode-matcher');
const sectionMixer = document.getElementById('section-mixer');
const sectionMatcher = document.getElementById('section-matcher');

btnModeMixer.addEventListener('click', () => {
    btnModeMixer.classList.add('active');
    btnModeMatcher.classList.remove('active');
    sectionMixer.style.display = 'block';
    sectionMatcher.style.display = 'none';
});

btnModeMatcher.addEventListener('click', () => {
    btnModeMatcher.classList.add('active');
    btnModeMixer.classList.remove('active');
    sectionMatcher.style.display = 'block';
    sectionMixer.style.display = 'none';
});


/* --- UTILITIES --- */
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

function colorDistance(rgb1, rgb2) {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

/* --- MIXER MODE LOGIC --- */
function initPalette() {
    wintonColors.forEach(color => {
        const item = document.createElement('div');
        item.classList.add('color-item');
        item.title = color.name;
        
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color.hex;
        swatch.dataset.name = color.name;
        
        const label = document.createElement('span');
        label.classList.add('color-label');
        label.textContent = color.name;
        
        item.appendChild(swatch);
        item.appendChild(label);
        
        item.addEventListener('click', () => toggleColorInMix(color, item));
        
        colorsGrid.appendChild(item);
    });
}

function toggleColorInMix(color, itemElement) {
    const existingIndex = currentMix.findIndex(item => item.color.name === color.name);
    if (existingIndex > -1) {
        currentMix.splice(existingIndex, 1);
        itemElement.classList.remove('selected');
    } else {
        currentMix.push({ color: color, ratio: 50 });
        itemElement.classList.add('selected');
    }
    renderSelectedColors();
    updateMix();
}

function renderSelectedColors() {
    selectedColorsContainer.innerHTML = '';
    
    if (currentMix.length === 0) {
        selectedColorsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-wand-magic-sparkles mb-2"></i>
                <p>Büyüyü başlatmak için soldaki paletten renk seçin.</p>
            </div>
        `;
        return;
    }
    
    currentMix.forEach((item, index) => {
        const mixItem = document.createElement('div');
        mixItem.classList.add('mix-item');
        mixItem.innerHTML = `
            <div class="mix-item-color" style="background-color: ${item.color.hex}"></div>
            <div class="slider-container">
                <span class="color-name-label">${item.color.name}</span>
                <input type="range" class="mix-item-slider" min="1" max="100" value="${item.ratio}" data-index="${index}">
            </div>
            <span class="mix-item-value">${item.ratio}</span>
            <button class="remove-color" data-index="${index}" title="Kaldır"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        const slider = mixItem.querySelector('.mix-item-slider');
        const valueDisplay = mixItem.querySelector('.mix-item-value');
        
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            currentMix[index].ratio = val;
            valueDisplay.textContent = val;
            updateMix();
        });

        const removeBtn = mixItem.querySelector('.remove-color');
        removeBtn.addEventListener('click', () => {
            const items = document.querySelectorAll('.color-item');
            items.forEach(it => {
                const swatch = it.querySelector('.color-swatch');
                if(swatch && swatch.dataset.name === item.color.name) {
                    it.classList.remove('selected');
                }
            });
            currentMix.splice(index, 1);
            renderSelectedColors();
            updateMix();
        });
        
        selectedColorsContainer.appendChild(mixItem);
    });
}

function updateMix() {
    if (currentMix.length === 0) {
        mixedColorPreview.style.backgroundColor = 'transparent';
        hexDisplay.textContent = '-';
        rgbDisplay.textContent = '-';
        compositionDisplay.textContent = '-';
        return;
    }

    let totalRatio = currentMix.reduce((sum, item) => sum + item.ratio, 0);
    let mixedRgb = [0, 0, 0];
    let sumR = 0, sumG = 0, sumB = 0;
    const colorNames = [];
    
    currentMix.forEach(item => {
        const weight = item.ratio / totalRatio;
        const rgb = hexToRgb(item.color.hex);
        sumR += Math.pow(rgb[0], 2) * weight;
        sumG += Math.pow(rgb[1], 2) * weight;
        sumB += Math.pow(rgb[2], 2) * weight;
        colorNames.push(item.color.name);
    });
    
    mixedRgb[0] = Math.round(Math.sqrt(sumR));
    mixedRgb[1] = Math.round(Math.sqrt(sumG));
    mixedRgb[2] = Math.round(Math.sqrt(sumB));

    const finalHex = rgbToHex(mixedRgb[0], mixedRgb[1], mixedRgb[2]);
    mixedColorPreview.style.backgroundColor = finalHex;
    hexDisplay.textContent = finalHex;
    rgbDisplay.textContent = `${mixedRgb[0]}, ${mixedRgb[1]}, ${mixedRgb[2]}`;
    
    if (colorNames.length === 1) {
        compositionDisplay.textContent = `${colorNames[0]} (Saf Renk)`;
    } else {
        compositionDisplay.textContent = colorNames.join(' + ') + ' Karışımı';
    }
}

resetBtn.addEventListener('click', () => {
    currentMix = [];
    const items = document.querySelectorAll('.color-item');
    items.forEach(it => it.classList.remove('selected'));
    renderSelectedColors();
    updateMix();
});

/* --- MATCHER MODE LOGIC --- */

// Update common UI when target changes
function updateTargetColorUI(hex) {
    currentlySelectedHexTarget = hex;
    targetHexDisplay.textContent = hex;
    selectedColorThumb.style.backgroundColor = hex;
}

// 1. Tab Switching
tabColorPicker.addEventListener('click', () => {
    tabColorPicker.classList.add('active');
    tabImageUpload.classList.remove('active');
    viewColorPicker.classList.add('active');
    viewImageUpload.classList.remove('active');
});

tabImageUpload.addEventListener('click', () => {
    tabImageUpload.classList.add('active');
    tabColorPicker.classList.remove('active');
    viewImageUpload.classList.add('active');
    viewColorPicker.classList.remove('active');
});

// 2. Manual Picker
targetColorPicker.addEventListener('input', (e) => {
    const hex = e.target.value.toUpperCase();
    targetColorPreview.style.backgroundColor = hex;
    updateTargetColorUI(hex);
});
updateTargetColorUI(targetColorPicker.value);

// 3. Image Upload & Canvas
uploadZone.addEventListener('click', () => imageInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
    }
});

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // Setup canvas
            imageCanvas.width = img.width;
            imageCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Switch UI
            uploadZone.style.display = 'none';
            canvasContainer.style.display = 'block';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

newImageBtn.addEventListener('click', () => {
    canvasContainer.style.display = 'none';
    uploadZone.style.display = 'block';
    imageInput.value = ''; // Reset input
});

// 4. Eyedropper on Canvas
imageCanvas.addEventListener('mousemove', (e) => {
    const rect = imageCanvas.getBoundingClientRect();
    // Calculate scale factor because canvas CSS size differs from render size
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Get pixel data
    try {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        
        // Show preview element
        eyedropperPreview.style.display = 'block';
        eyedropperPreview.style.left = `${e.clientX - rect.left}px`;
        eyedropperPreview.style.top = `${e.clientY - rect.top - 30}px`; // slightly above cursor
        eyedropperPreview.style.backgroundColor = hex;
    } catch(err) {
        // CORS or out of bounds
    }
});

imageCanvas.addEventListener('mouseleave', () => {
    eyedropperPreview.style.display = 'none';
});

imageCanvas.addEventListener('click', (e) => {
    const rect = imageCanvas.getBoundingClientRect();
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    try {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        updateTargetColorUI(hex);
        
        // Optional: create a flash effect on the canvas wrapper
        const wrapper = document.querySelector('.canvas-wrapper');
        wrapper.style.borderColor = 'var(--accent-color)';
        setTimeout(() => wrapper.style.borderColor = 'var(--border-color)', 200);
    } catch(err) {
        console.error("Canvas read error", err);
    }
});

// 5. Algorithm Matching
function findBestMatch(targetRgb) {
    let bestMatch = null;
    let minDistance = Infinity;

    for (const color of wintonColors) {
        const rgb = hexToRgb(color.hex);
        const dist = colorDistance(targetRgb, rgb);
        
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = {
                accuracy: 100 - (dist / 441.67) * 100,
                ingredients: [{ color: color, parts: 1 }]
            };
        }
    }

    const ratios = [
        {w1: 0.5, w2: 0.5, str: "1 : 1"},
        {w1: 0.33, w2: 0.67, str: "1 : 2"},
        {w1: 0.67, w2: 0.33, str: "2 : 1"},
        {w1: 0.2, w2: 0.8, str: "1 : 4"},
        {w1: 0.8, w2: 0.2, str: "4 : 1"}
    ];

    for (let i = 0; i < wintonColors.length; i++) {
        for (let j = i + 1; j < wintonColors.length; j++) {
            const c1 = wintonColors[i];
            const c2 = wintonColors[j];
            const rgb1 = hexToRgb(c1.hex);
            const rgb2 = hexToRgb(c2.hex);

            for (const ratio of ratios) {
                const mixR = Math.round(Math.sqrt(Math.pow(rgb1[0], 2) * ratio.w1 + Math.pow(rgb2[0], 2) * ratio.w2));
                const mixG = Math.round(Math.sqrt(Math.pow(rgb1[1], 2) * ratio.w1 + Math.pow(rgb2[1], 2) * ratio.w2));
                const mixB = Math.round(Math.sqrt(Math.pow(rgb1[2], 2) * ratio.w1 + Math.pow(rgb2[2], 2) * ratio.w2));
                
                const dist = colorDistance(targetRgb, [mixR, mixG, mixB]);
                
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = {
                        accuracy: 100 - (dist / 441.67) * 100,
                        ingredients: [
                            { color: c1, parts: ratio.str.split(' : ')[0] },
                            { color: c2, parts: ratio.str.split(' : ')[1] }
                        ]
                    };
                }
            }
        }
    }

    return bestMatch;
}

findMatchBtn.addEventListener('click', () => {
    const targetHex = currentlySelectedHexTarget;
    const targetRgb = hexToRgb(targetHex);
    
    recipeContainer.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-spinner fa-spin mb-2"></i>
            <p>Laboratuvar karıştırılıyor...</p>
        </div>
    `;

    setTimeout(() => {
        const result = findBestMatch(targetRgb);
        
        let accuracyClass = 'good';
        if (result.accuracy < 80) accuracyClass = 'poor';
        if (result.accuracy > 95) accuracyClass = 'excellent';

        let html = `
            <div class="recipe-card">
                <div class="match-accuracy">
                    <span class="accuracy-label">Benzerlik Oranı:</span>
                    <span class="accuracy-value" style="color: ${result.accuracy > 90 ? '#10b981' : (result.accuracy > 80 ? '#f59e0b' : '#ef4444')}">%${result.accuracy.toFixed(1)}</span>
                </div>
                <div class="ingredients-list">
        `;

        result.ingredients.forEach(ing => {
            html += `
                <div class="ingredient-item">
                    <div class="ingredient-color" style="background-color: ${ing.color.hex}"></div>
                    <div class="ingredient-details">
                        <span class="ingredient-name">${ing.color.name}</span>
                        <span class="ingredient-ratio">${ing.parts} Birim</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        recipeContainer.innerHTML = html;
    }, 600);
});


// Initialize Mixer on load
initPalette();
updateMix();
