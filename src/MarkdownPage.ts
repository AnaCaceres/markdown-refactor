import { Anchor } from "./Anchor";
import { MarkdownText } from "./types";

export class MarkdownPage {
  constructor(private readonly content: MarkdownText) {}

  moveLinksToFootNotesWithAnchors(): MarkdownText {
    const anchors = this.findAnchorsAtPage(this.content);
    const anchorsFootnotesRelations = this.getAnchorsFootnotesRelations(anchors);
    const replacedText = this.replaceAnchors(this.content, anchorsFootnotesRelations);

    return this.addFootNotes(replacedText, anchorsFootnotesRelations);
  }

  private getAnchorsFootnotesRelations(anchors: Anchor[]) {
    const createDictionaryFromAnchors = (
      total: Record<string, Anchor>,
      current: Anchor,
      index: number
    ) => {
      return { ...total, [`[^anchor${index + 1}]`]: current };
    };
    const anchorsFootnotesRelations = anchors.reduce(createDictionaryFromAnchors, {});

    return anchorsFootnotesRelations;
  }

  findAnchorsAtPage(text: MarkdownText): Array<Anchor> {
    const anchors: Array<Anchor> = new Array<Anchor>();

    if (this.containsAnchor(text)) {
      const openingTag = "[";
      const closingTag = ")";
      const closingTagPosition = text.indexOf(closingTag);
      const openingTagPosition = text.indexOf(openingTag);

      const anchorExpression = text.substring(
        openingTagPosition,
        closingTagPosition + closingTag.length
      );
      const rest = text.substring(closingTagPosition + closingTag.length);
      const anchor = Anchor.fromMarkdownExpression(anchorExpression);
      anchors.push(anchor);

      const results = this.findAnchorsAtPage(rest);
      results.forEach((item) => {
        const alreadyInList = anchors.find((current) => current.isEqual(item));
        if (!alreadyInList) {
          anchors.push(item);
        }
      });
    }
    return anchors;
  }

  private replaceAnchors(content: MarkdownText, anchorsFootnotesRelations: Record<string, Anchor>): MarkdownText {
    let outputContent = content;
    Object.keys(anchorsFootnotesRelations).forEach((footnoteKey) => {
      outputContent = outputContent.replaceAll(
        `[${anchorsFootnotesRelations[footnoteKey].text}](${anchorsFootnotesRelations[footnoteKey].url})`,
        `${anchorsFootnotesRelations[footnoteKey].text} ${footnoteKey}`
      );
    });

    return outputContent;
  }

  addFootNotes(text: MarkdownText, anchorsFootnotesRelations: Record<string, Anchor>): MarkdownText {
    const anchorToFootnote = (footnoteKey: string) =>
      `${footnoteKey}: ${anchorsFootnotesRelations[footnoteKey].url}`;
    return [text, ...Object.keys(anchorsFootnotesRelations).map(anchorToFootnote)].join(
      "\n\n"
    ) as MarkdownText;
  }

  private containsAnchor(text: MarkdownText) {
    return text.match(/.*\[.*?\]\(.*?\).*/);
  }
}
