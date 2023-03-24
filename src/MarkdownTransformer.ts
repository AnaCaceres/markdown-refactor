import {FileSystem} from "./filesystem";
import {MarkdownPage} from "./MarkdownPage";
import { FilePath, MarkdownText } from "./types";

export class MarkDownTransformer {
    constructor(private fileSystem: FileSystem = new FileSystem()) {}

    transform(inputFile: FilePath, outputFile: FilePath) {
        if(!this.fileSystem.exists(inputFile)) {
            throw new Error("Input file does not exists")
        }
        if(this.fileSystem.exists(outputFile)) {
            throw new Error("Output file already exists")
        }
        const content = this.fileSystem.readContent(inputFile)
        const transformedMarkDown = this.turnLinksIntoFooter(content)
        this.fileSystem.writeContent(outputFile, transformedMarkDown)

    }

    private turnLinksIntoFooter(content: MarkdownText): MarkdownText {
        return new MarkdownPage(content).moveLinksToFootNotesWithAnchors()
    }
}