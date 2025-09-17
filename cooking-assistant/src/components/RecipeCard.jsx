export default function RecipeCard({ title, desc, img, tag }) {
    const badgeColor = tag === "FREE" ? "bg-green-500" : "bg-orange-500";
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden w-full">
        <img src={img} alt={title} className="w-full h-32 object-cover" />
        <span className={`absolute m-2 px-2 py-1 text-xs text-white rounded ${badgeColor}`}>
          {tag}
        </span>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    );
  }
  