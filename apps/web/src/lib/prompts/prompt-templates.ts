export const PROMPT_TEMPLATES = [
  {
    id: "cinematic-portrait",
    title: "Cinematic Portrait",
    type: "image",
    category: "Portrait",
    prompt:
      "A cinematic portrait of a confident young creator, dramatic soft lighting, shallow depth of field, ultra detailed skin texture, premium editorial styling, subtle film grain, luxury magazine photography",
    negativePrompt:
      "blurry, low quality, distorted face, extra fingers, bad anatomy, overexposed highlights"
  },
  {
    id: "luxury-product-ad",
    title: "Luxury Product Ad",
    type: "image",
    category: "Marketing",
    prompt:
      "A premium product advertisement scene, elegant studio lighting, reflective black surface, luxury brand aesthetic, clean composition, sharp macro detail, high-end commercial photography, sophisticated mood",
    negativePrompt:
      "messy background, watermark, text artifacts, poor reflections, clutter, low resolution"
  },
  {
    id: "afrofuturist-cityscape",
    title: "Afrofuturist Skyline",
    type: "image",
    category: "Worldbuilding",
    prompt:
      "An afrofuturist megacity at sunset, glowing towers, layered sky bridges, cinematic haze, rich gold and teal lighting, ultra detailed architecture, epic scale, premium concept art realism",
    negativePrompt:
      "flat lighting, blurry skyline, low detail, empty scene, dull colors, warped buildings"
  },
  {
    id: "streetwear-editorial",
    title: "Streetwear Editorial",
    type: "image",
    category: "Fashion",
    prompt:
      "A high-fashion streetwear editorial shot in an urban setting, confident pose, moody natural light, crisp textures, shallow depth of field, premium magazine styling, authentic luxury fashion campaign",
    negativePrompt:
      "awkward pose, blurry clothing, low detail, duplicate limbs, poor proportions"
  },
  {
    id: "architectural-interior",
    title: "Luxury Interior",
    type: "image",
    category: "Interior",
    prompt:
      "A luxury modern interior with floor-to-ceiling windows, warm ambient lighting, refined materials, polished stone and wood textures, magazine-quality composition, realistic architectural photography",
    negativePrompt:
      "distorted perspective, messy furniture, poor lighting, low detail, noisy shadows"
  },
  {
    id: "fantasy-character-poster",
    title: "Fantasy Hero Poster",
    type: "image",
    category: "Character",
    prompt:
      "A heroic fantasy character poster, dramatic backlight, flowing fabric, intricate armor details, cinematic atmosphere, richly textured environment, blockbuster movie poster realism",
    negativePrompt:
      "flat pose, blurry armor, extra limbs, low quality, washed out scene"
  },
  {
    id: "food-commercial-shot",
    title: "Food Commercial Shot",
    type: "image",
    category: "Food",
    prompt:
      "A premium food commercial close-up, appetizing textures, soft cinematic lighting, shallow depth of field, refined plating, mouthwatering realism, luxury restaurant campaign aesthetic",
    negativePrompt:
      "messy plating, low detail, overcooked look, blur, dull lighting, text"
  },
  {
    id: "travel-poster-coastline",
    title: "Dream Travel Poster",
    type: "image",
    category: "Travel",
    prompt:
      "A dream travel poster scene of a dramatic coastline, golden sunrise, crystal water, lush cliffs, cinematic composition, vibrant but realistic colors, luxury tourism campaign photography",
    negativePrompt:
      "flat sky, muddy water, low detail, haze overload, bad composition"
  },
  {
    id: "fashion-runway-clip",
    title: "Fashion Runway Clip",
    type: "video",
    category: "Fashion",
    prompt:
      "A cinematic fashion runway scene, elegant model walking confidently, smooth camera tracking, luxury lighting, modern editorial mood, rich contrast, premium fashion film energy",
    negativePrompt:
      "blurry, shaky, distorted motion, bad anatomy, awkward walk cycle"
  },
  {
    id: "epic-story-opening",
    title: "Epic Story Opening",
    type: "video",
    category: "Storytelling",
    prompt:
      "An epic cinematic opening scene, wide establishing shot, dramatic atmosphere, slow camera push, emotional lighting, sweeping movie trailer style, premium blockbuster pacing",
    negativePrompt:
      "low quality, unstable camera, bad motion, muddy lighting, chaotic composition"
  },
  {
    id: "product-launch-reveal",
    title: "Product Launch Reveal",
    type: "video",
    category: "Marketing",
    prompt:
      "A luxury product reveal video, dramatic spotlight, slow turntable motion, glossy reflections, premium commercial mood, elegant camera movement, high-end brand film aesthetic",
    negativePrompt:
      "shaky motion, poor reflections, text artifacts, flicker, cluttered frame"
  },
  {
    id: "drone-city-flyover",
    title: "Drone City Flyover",
    type: "video",
    category: "Travel",
    prompt:
      "A cinematic drone flyover above a futuristic city at blue hour, smooth forward movement, glowing skyline, atmospheric depth, premium travel documentary cinematography",
    negativePrompt:
      "jerky camera, low detail, unstable horizon, dull lighting, bad motion blur"
  },
  {
    id: "music-video-performance",
    title: "Music Video Performance",
    type: "video",
    category: "Performance",
    prompt:
      "A stylish music video performance scene, moody colored lights, confident performer, rhythmic camera motion, luxury stage design, polished cinematic movement",
    negativePrompt:
      "shaky footage, bad sync feeling, flat lighting, awkward motion, low quality"
  },
  {
    id: "nature-documentary-moment",
    title: "Nature Documentary Moment",
    type: "video",
    category: "Nature",
    prompt:
      "A breathtaking nature documentary shot, golden light through mist, gentle camera glide, immersive atmosphere, richly detailed environment, premium cinematic realism",
    negativePrompt:
      "unnatural motion, overprocessed look, blur, low detail, unstable framing"
  },
  {
    id: "startup-office-broll",
    title: "Startup Office B-Roll",
    type: "video",
    category: "Business",
    prompt:
      "A polished startup office b-roll shot, modern workspace, natural movement, soft window light, premium brand documentary style, smooth handheld realism",
    negativePrompt:
      "shaky footage, clutter, low detail, awkward movement, noisy image"
  }
] as const;
