import { useState, useCallback } from "react";
import { BackButton, Button, Header, Loading } from "components";
import { fetchDataFromApi, toQuery } from "services";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

export default function ChangeCorpus() {
  const [filepath, setFilepath] = useState([]);
  const [error, setError] = useState();
  const [errorPath, setErrorPath] = useState();
  const [waiting, setWaiting] = useState(false);
  const [corpusFile, setCorpusFile] = useState([]);
  const [rowsFile, setRowsFile] = useState([]);

  const handleButton = () => {
    if (filepath.length > 0) {
      setWaiting(true);
      let query = toQuery([["supercorpusFilepath", filepath]]);
      fetchDataFromApi(`/processSupercorpus/${query}`)
        .then((data) => {
          setWaiting(false);
          setError(!data.success);
          if (data.success) {
            setCorpusFile(data.corpus_file);
            setRowsFile(data.rows_file);
          } else {
            setErrorPath(filepath);
          }
        })
        .catch((err) => {
          setError(err.message);
          setWaiting(false);
        });
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (navigator.userAgent.includes("Mac")) {
      const folderPaths = acceptedFiles.map((file) => {
        const parts = file.path.split("/");
        const directoryPath = parts.slice(0, -1).join("/");
        return directoryPath;
      });

      const uniqueFolderPaths = Array.from(new Set(folderPaths));

      const path = uniqueFolderPaths[0] + "/";

      setFilepath(path);
    } else {
      const folderPaths = acceptedFiles.map((file) => {
        const parts = file.path.split("\\");
        const directoryPath = parts.slice(0, -1).join("/");
        return directoryPath;
      });

      const uniqueFolderPaths = Array.from(new Set(folderPaths));

      const path = uniqueFolderPaths[0].slice(2) + "/";
      setFilepath(path);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    directory: true,
    noClick: true,
  });

  return (
    <>
      <Header>
        <BackButton screenName="Upload or Update Corpus" />
      </Header>
      <div
        className="container-input-fileName"
        {...getRootProps({ className: "dropzone" })}
      >
        <input {...getInputProps()} />

        <div className="center-component">
          <div className="drop-input">
            <div className="center-component">
              <div className="align-horizontal">
                <Icon
                  icon="bi:folder"
                  width="40px"
                  height="40px"
                  color="#2c2c2c"
                />
              </div>
            </div>

            <div>
              <div className="center-component">
                <p style={{ color: "#2c2c2c" }}>
                  {filepath.length > 0
                    ? filepath
                    : "Please drag and drop the folder that contains corpus documents"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="center-component" style={{ marginTop: 20 }}>
          <Button
            label="Ready!"
            color="green"
            icon="solar:upload-outline"
            onClick={() => handleButton()}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {errorPath && (
          <div className="center-component" style={{ color: "red" }}>
            Cannot locate {errorPath}
          </div>
        )}
        {error && (
          <div className="center-component" style={{ color: "red" }}>
            {error}
          </div>
        )}
        {error === false && (
          <div className="center-component">
            All done! Your corpus is now ready to be used. The corpus name is{" "}
            <b>{corpusFile}</b> and its associated default row labels are stored
            in <b>{rowsFile}</b>.
          </div>
        )}
        {waiting && (
          <div>
            <div className="center-component">
              <Loading />
            </div>
            <div className="center-component">
              Preparing corpus...If this is a new corpus, this step can take a
              long time.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
