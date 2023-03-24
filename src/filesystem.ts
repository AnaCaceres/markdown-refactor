import * as fs from "fs";
import { FilePath, MarkdownText } from "./types";

export class FileSystem {
  exists(file: FilePath) {
    return fs.existsSync(file);
  }

  readContent(file: FilePath): MarkdownText {
    return fs.readFileSync(file).toString() as MarkdownText;
  }

  writeContent(file: FilePath, transformedMarkDown: MarkdownText): void {
    fs.writeFileSync(file, transformedMarkDown);
  }
}
