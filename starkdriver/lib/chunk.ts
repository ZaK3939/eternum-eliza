/**
 * Splits text into chunks of a fixed size, trying to break at sentence boundaries
 * @param text The text to split into chunks
 * @param chunkSize The maximum size of each chunk in characters
 * @param overlap The number of characters to overlap between chunks
 * @returns Array of text chunks
 */
export function chunk(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  // Handle empty or invalid input
  if (!text || chunkSize <= 0 || overlap >= chunkSize) {
    return [];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  let lastChunkEndContent = '';

  // Split into sentences first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    // If adding this sentence would exceed chunk size
    if ((currentChunk + sentence).length > chunkSize) {
      // If current chunk is not empty, push it
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        // Store the end of the current chunk for overlap
        lastChunkEndContent = currentChunk.slice(-overlap);
        currentChunk = lastChunkEndContent;
      }
      
      // If single sentence is longer than chunk size, force split
      if (sentence.length > chunkSize) {
        const words = sentence.split(' ');
        for (const word of words) {
          if ((currentChunk + ' ' + word).length > chunkSize) {
            chunks.push(currentChunk.trim());
            lastChunkEndContent = currentChunk.slice(-overlap);
            currentChunk = lastChunkEndContent;
            currentChunk += word;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + word;
          }
        }
      } else {
        currentChunk = lastChunkEndContent + (lastChunkEndContent ? ' ' : '') + sentence;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Push final chunk if not empty
  if (currentChunk && currentChunk !== lastChunkEndContent) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
