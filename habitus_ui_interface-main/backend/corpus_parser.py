import io
import os
import pandas as pd
import sys
import textract

from nltk.tokenize import sent_tokenize

class Parser():
    def parse(self, text: str) -> list[str]:
        pass

class SpacyParser(Parser):
    def parse(self, text: str) -> list[str]:
        pass

class NltkParser(Parser):

    def count_leading(self, text: str, sep: str) -> int:
        index = 0
        while index < len(text) and text[index] == sep:
            index += 1
        return index

    def count_adjacent(self, text: str, index: int, sep: str) -> list[int]:
        if text[index] != sep:
            return 0
        else:
            before, after = text[0:index], text[index+1:]
            before_count = self.count_leading(before[::-1], sep)
            after_count = self.count_leading(after, sep)
            return before_count + 1 + after_count

    def preprocess(self, text: str) -> str:
        # Replace all \r\n with \n.
        # Replace all \r with \n.
        # Replace lone \n with space.
        # Two or more \n probably mark the ends of paragraphs.
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")
        adjacent_counts = [self.count_adjacent(text, index, '\n') for index in range(len(text)) ]
        text = "".join([" " if count == 1 else text[index] for index, count in enumerate(adjacent_counts)])
        return text

    def postprocess_sentence(self, sentence: str) -> str:
        # Replace all \n with space.
        # Replace multiple spaces with single spaces.
        # Trim.
        sentence = sentence.replace("\n", " ")
        sentence = " ".join(sentence.split())
        sentence = sentence.strip()
        return sentence

    def postprocess_sentences(self, sentences: list[str]) -> list[str]:
        # Postprocess sentences.
        # Remove empty sentences.
        sentences = [self.postprocess_sentence(sentence) for sentence in sentences]
        sentences = [sentence + "\n" for sentence in sentences if len(sentence) > 0]
        return sentences

    def parse(self, text: str) -> list[str]:
        preprocessed = self.preprocess(text)
        sentences = sent_tokenize(preprocessed)
        postprocessed = self.postprocess_sentences(sentences)
        return postprocessed

def parse_supercorpus(corpus_name, input_dir, output_filepath):

    if os.path.exists(output_filepath):
        if not os.path.isdir(output_filepath):
            raise Exception("{output_filepath} is not a directory")
    else:
        os.mkdir(output_filepath)

    output_file = output_filepath + corpus_name
    output_extension = ".csv"
    encoding = "utf-8"
    parser = NltkParser()

    all_lines = []
    row_labels = []
    for input_filename in os.listdir(input_dir):
        if '.' in input_filename:
            split = input_filename.split('.')
            name = split[0]
            input_extension = split[1]
        else:
            name = input_filename
        input_pathname = os.path.join(input_dir, input_filename)
        if not os.path.isfile(input_pathname):
            print(f" Input: {input_pathname} is not a file.\n")
        elif input_extension not in ['txt', 'docx', 'doc', 'rtf']:
            print(f" {input_extension} file type not supported.\n")
        else:
            print(f" Input: {input_pathname}")
            input_text = textract.process(input_pathname, encoding = encoding).decode(encoding)
            output_lines = parser.parse(input_text)
            all_lines += output_lines
            row_labels += [name]*len(output_lines)

    pd.DataFrame({'sentence': all_lines}).to_csv(output_file + output_extension, encoding = encoding)

    rows = pd.DataFrame({'readable': all_lines, 'label': row_labels})
    df = pd.concat([rows.drop('label', 1), pd.get_dummies(rows.label)], axis = 1)
    for col in df.columns:
        if 'Unnamed:' in col:
            df.drop(col, inplace = True)
    df['all'] = 1
    df.to_csv(output_file + '_row_labels.csv')

    print(f"Output: {output_file}\n")




