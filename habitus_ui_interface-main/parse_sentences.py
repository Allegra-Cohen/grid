from nltk.tokenize import sent_tokenize

import io
import os
import sys


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

if __name__ == '__main__':
    input_dirname = sys.argv[1]
    output_dirname = sys.argv[2]

    if os.path.exists(output_dirname):
        if not os.path.isdir(output_dirname):
            raise Exception("The output directory is not really a directory.") 
    else:
        os.mkdir(output_dirname)

    input_extension = ".txt"
    output_extension = ".csv"
    encoding = "utf-8"
    parser = NltkParser()

    for input_filename in os.listdir(input_dirname):
        input_pathname = os.path.join(input_dirname, input_filename)
        if not os.path.isfile(input_pathname):
            print(f" Input: {input_pathname} is not a file.\n")
        elif not input_filename.endswith(input_extension):
            print(f" Input: {input_pathname} has the wrong extension.\n")
        else:
            print(f" Input: {input_pathname}")
            output_filename = input_filename[0:-len(input_extension)] + output_extension
            output_pathname = os.path.join(output_dirname, output_filename)
            if os.path.exists(output_pathname):
                print(f"Output: {output_pathname} already exists.\n")
            else:
                print(f"Output: {output_pathname}\n")
                input_file = io.open(input_pathname, mode="r", encoding=encoding)
                input_text = input_file.read()
                input_file.close()

                output_lines = parser.parse(input_text)

                output_file = io.open(output_pathname, mode="w", encoding=encoding)
                output_file.writelines(output_lines)
                output_file.close()
