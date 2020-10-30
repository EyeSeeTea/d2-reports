export interface FileRepository {
    save(buffer: string, filename: string, mimeType: string): Promise<void>;
}
