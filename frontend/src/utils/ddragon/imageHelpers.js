// Only keep non-URL helpers

export const getRuneTreeColor = (styleId) => {
  switch (styleId) {
    case 8000:
      return "bg-yellow-500" // Precision
    case 8100:
      return "bg-red-500" // Domination
    case 8200:
      return "bg-blue-500" // Sorcery
    case 8300:
      return "bg-teal-500" // Inspiration
    case 8400:
      return "bg-green-500" // Resolve
    default:
      return "bg-gray-500"
  }
}

export const getRuneTreeAbbr = (styleId) => {
  switch (styleId) {
    case 8000:
      return "PR" // Precision
    case 8100:
      return "DO" // Domination
    case 8200:
      return "SO" // Sorcery
    case 8300:
      return "IN" // Inspiration
    case 8400:
      return "RE" // Resolve
    default:
      return "??"
  }
}
