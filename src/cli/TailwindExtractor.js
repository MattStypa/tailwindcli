// Custom PurgeCSS extractor for Tailwind that allows special characters in class names.
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || []
  }
}

module.exports = TailwindExtractor
