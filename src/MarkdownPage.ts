import { Anchor } from "./Anchor";

export class MarkdownPage {
  constructor(private readonly content: string) {}

  moveLinksToFootNotesWithAnchors(): string {
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

  findAnchorsAtPage(text: string): Array<Anchor> {
    const anchors: Array<Anchor> = new Array<Anchor>();

    if (this.containsAnchor(text)) {
      const openingTag = "[";
      const closingTag = ")";
      const closingTagPosition = text.indexOf(closingTag);
      const openingTagPosition = text.indexOf(openingTag);

      const anchoreExpression = text.substring(
        openingTagPosition,
        closingTagPosition + closingTag.length
      );
      const rest = text.substring(closingTagPosition + closingTag.length);
      const anchor = Anchor.fromMarkdownExpression(anchoreExpression);
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

  private replaceAnchors(
    inputContent: string,
    anchorsDictionary: Record<string, Anchor>
  ): string {
    let outputContent = inputContent;
    Object.keys(anchorsDictionary).forEach((key) => {
      outputContent = outputContent.replaceAll(
        `[${anchorsDictionary[key].text}](${anchorsDictionary[key].url})`,
        `${anchorsDictionary[key].text} ${key}`
      );
    });

    return outputContent;
  }

  addFootNotes(
    text: string,
    anchorsDictionary: Record<string, Anchor>
  ): string {
    const anchorToFootnote = (footnoteKey: string) =>
      `${footnoteKey}: ${anchorsDictionary[footnoteKey].url}`;
    return [text, ...Object.keys(anchorsDictionary).map(anchorToFootnote)].join(
      "\n\n"
    );
  }

  private containsAnchor(text: string) {
    return text.match(/.*\[.*?\]\(.*?\).*/);
  }
}
