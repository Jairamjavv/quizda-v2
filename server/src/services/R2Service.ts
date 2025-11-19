/**
 * R2 Storage Service
 * Handles uploading and retrieving quiz questions from Cloudflare R2
 */

export interface QuizQuestion {
  type: string;
  data: any;
}

export class R2Service {
  constructor(private bucket: R2Bucket) {}

  /**
   * Upload quiz questions to R2
   * @param quizId - The quiz ID
   * @param questions - Array of quiz questions
   * @returns The R2 key for the stored questions
   */
  async uploadQuizQuestions(
    quizId: number,
    questions: QuizQuestion[]
  ): Promise<string> {
    const key = `quizzes/${quizId}/questions.json`;
    const content = JSON.stringify(questions);

    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType: "application/json",
      },
    });

    return key;
  }

  /**
   * Retrieve quiz questions from R2
   * @param r2Key - The R2 key for the questions
   * @returns Array of quiz questions
   */
  async getQuizQuestions(r2Key: string): Promise<QuizQuestion[]> {
    const object = await this.bucket.get(r2Key);

    if (!object) {
      throw new Error("Quiz questions not found in storage");
    }

    const content = await object.text();
    return JSON.parse(content);
  }

  /**
   * Delete quiz questions from R2
   * @param r2Key - The R2 key for the questions
   */
  async deleteQuizQuestions(r2Key: string): Promise<void> {
    await this.bucket.delete(r2Key);
  }

  /**
   * Check if quiz questions exist in R2
   * @param r2Key - The R2 key for the questions
   * @returns true if questions exist, false otherwise
   */
  async questionsExist(r2Key: string): Promise<boolean> {
    const object = await this.bucket.head(r2Key);
    return object !== null;
  }
}
