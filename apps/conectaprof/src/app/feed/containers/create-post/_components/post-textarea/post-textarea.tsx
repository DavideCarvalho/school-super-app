import type { ContentBlock, DraftDecoratorComponentProps } from "draft-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CompositeDecorator, Editor, EditorState } from "draft-js";

import "draft-js/dist/Draft.css";

export interface HashtagTextareaProps {
  text: string;
  setText: (text: string) => void;
}

const HashtagSpan = (props: DraftDecoratorComponentProps) => {
  return (
    <span {...props} className="text-blue-500">
      {props.children}
    </span>
  );
};

export function HashtagTextarea({ text, setText }: HashtagTextareaProps) {
  const HASHTAG_REGEX = /#\w+/g;

  const findWithRegex = useCallback(
    (
      regex: RegExp,
      contentBlock: ContentBlock,
      callback: (start: number, end: number) => void,
    ) => {
      const text = contentBlock.getText();
      let matchArr: RegExpExecArray | null;
      let start: number;
      // biome-ignore lint/suspicious/noAssignInExpressions: Not bad here
      while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
      }
    },
    [],
  );

  const hashtagStrategy = useCallback(
    (
      contentBlock: ContentBlock,
      callback: (start: number, end: number) => void,
    ) => {
      findWithRegex(HASHTAG_REGEX, contentBlock, callback);
    },
    [findWithRegex],
  );

  const compositeDecorator = useMemo(
    () =>
      new CompositeDecorator([
        {
          strategy: hashtagStrategy,
          component: HashtagSpan,
        },
      ]),
    [hashtagStrategy],
  );

  const [editorState, setEditorState] = useState<EditorState | null>(null);

  useEffect(() => {
    setEditorState(() => EditorState.createEmpty(compositeDecorator));
  }, [compositeDecorator]);

  function handleChange(editorState: EditorState) {
    const content = editorState.getCurrentContent();
    setText(content.getPlainText());
    setEditorState(editorState);
  }

  if (!editorState) return null;
  return (
    <div className="relative w-full">
      <Editor editorState={editorState} onChange={handleChange} />
    </div>
  );
}
