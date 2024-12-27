import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import formidable from 'formidable';
import * as fs from 'fs/promises';
import * as pdf from 'pdf-parse';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class PdfProcessorService {

  private hf = new HfInference(process.env.HF_ACCESS_TOKEN);

  async handleFileUpload(req): Promise<{ file: any; metadata: any }> {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => mimetype === 'application/pdf',
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return reject(err);
        }

        const file = files.file[0];
        const metadata = {
          userId: fields.userId,
          submissionId: fields.submissionId,
          title: fields.title,
          uploadType: fields.uploadType,
        };

        const filePath = `./uploads/${file.newFilename}`;
        await fs.rename(file.filepath, filePath);

        resolve({
          file: {
            url: filePath,
            type: file.mimetype,
            size: file.size,
          },
          metadata,
        });
      });
    });
  }

  // async fetchFile(fileUrl: string): Promise<Buffer> {
  //   console.log(fs.readFile(fileUrl), fileUrl, 'fmldmlm')
  //   return await fs.readFile(fileUrl);
  // }

  async fetchFile(fileUrl: string): Promise<Buffer> {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async parsePdfContent(fileBuffer: Buffer): Promise<string> {
    const data = await pdf(fileBuffer);
    return data.text;
  }

  async summarizeText(text: string): Promise<string> {
    if (!text || typeof text !== 'string') {
      throw new BadRequestException('Invalid input text');
    }

    if (!process.env.HF_ACCESS_TOKEN) {
      throw new InternalServerErrorException('API key not configured');
    }

    try {
      const truncatedText = text.slice(0, 1000); // BART model limit

      const response = await this.hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: text,
        parameters: {
          max_length: 1500,
          min_length: 100,
          // do_sample: false,
          temperature: 0.7,
        },
      });

      if (!response?.summary_text) {
        throw new InternalServerErrorException('Failed to generate summary');
      }

      return response.summary_text;
    } catch (error) {
      console.error('Summarization error:', error);
      throw new InternalServerErrorException('Summarization failed');
    }
  }
}
