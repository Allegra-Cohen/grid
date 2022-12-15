from nltk.tokenize import sent_tokenize

import io
import os
import sys

class NltkParser():

    def count_leading(self, text: str, sep: str) -> int:
        index = 0
        while index < len(text) and text[index] == sep:
            index += 1
        return index

    def count_adjacent(self, text: str, index: int, sep: str) -> list[int]:
        if text[index] != sep:
            return 0
        else:
            prefix, suffix = text[0:index], text[index+1:]
            leading = self.count_leading(prefix[::-1], sep)
            trailing = self.count_leading(suffix, sep)
            return leading + 1 + trailing

    def preprocess(self, text: str) -> str:
        # Replace all \r\n with \n.
        # Replace all \r with \n.
        # Replace lone \n with space.
        # Two or more probably mark the end of paragraphs.
        text1 = text.replace("\r\n", "\n")
        text2 = text1.replace("\r", "\n")
        adjacent_counts = [self.count_adjacent(text2, index, '\n') for index in range(len(text2)) ]
        text3 = "".join([" " if count == 1 else text2[index] for index, count in enumerate(adjacent_counts)])
        return text3

    def postprocess_sentence(self, sentence: str) -> str:
        # Replace all \n with space.
        # Replace multiple spaces with single spaces.
        # Trim.
        sentence1 = sentence.replace("\n", " ")
        sentence2 = " ".join(sentence1.split())
        sentence3 = sentence2.strip()
        return sentence3

    def postprocess_sentences(self, sentences: list[str]) -> list[str]:
        # Postprocess sentences.
        # Remove empty sentences.
        sentences1 = [self.postprocess_sentence(sentence) for sentence in sentences]
        sentences2 = [sentence + "\n" for sentence in sentences1 if len(sentence) > 0]
        return sentences2

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
    sentence_parser = NltkParser()

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

                output_lines = sentence_parser.parse(input_text)

                output_file = io.open(output_pathname, mode="w", encoding=encoding)
                output_file.writelines(output_lines)
                output_file.close()
