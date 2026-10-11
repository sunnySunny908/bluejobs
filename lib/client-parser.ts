// lib/client-parser.ts
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { db } from './dexie';
import { getSessionId } from './session';

// ✅ DYNAMIC FIX: Automatically match the worker version to the installed pdfjs-dist version
// This prevents ANY version mismatch errors forever
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Native SHA-256 Hashing (Zero dependencies)
async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function parseFileLocally(file: File) {
  const fileName = file.name.toLowerCase();
  let text = '';

  if (fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    
    // Properly handle the loading task promise
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    // Extract text page by page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    text = fullText;
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }

  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length < 50) {
    throw new Error('Could not extract enough text from the file.');
  }

  // Generate Hash
  const textHash = await hashText(cleanText);
  const sessionId = getSessionId();

  // Store raw file securely in browser's IndexedDB
  await db.files.add({
    sessionId,
    fileName: file.name,
    fileBlob: file,
    uploadedAt: new Date()
  });

  // Return ONLY what the backend needs (NO raw file upload!)
  return {
    text: cleanText,
    hash: textHash,
    sessionId,
    fileName: file.name
  };
}