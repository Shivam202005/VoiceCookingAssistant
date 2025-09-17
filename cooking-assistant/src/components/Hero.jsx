export default function Hero() {
    return (
      <section className="relative h-72 flex items-center justify-center bg-black">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
          alt="Salad" className="absolute w-full h-full object-cover opacity-90" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Recipes with AI</h1>
          <p className="text-lg">Search or ask our AI assistant for step-by-step cooking help.</p>
        </div>
      </section>
    );
  }
  