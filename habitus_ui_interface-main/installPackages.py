import subprocess

packages_to_install = [
    'nltk==3.7',
]

def install_packages(packages):
    for package in packages:
        subprocess.run(['pip3', 'install', package], check=True)

def install_nltkDownloader():
    subprocess.run(['python3', '-m', 'nltk.downloader', 'stopwords'], check=True)
    subprocess.run(['python3', '-m', 'nltk.downloader', 'punkt'], check=True)

def main():
    try:
        install_packages(packages_to_install)
        install_nltkDownloader()
        print("Packages successfully installed.")
    except Exception as e:
        print(f"Failed to install the packages: {e}")

if __name__ == "__main__":
    main()
