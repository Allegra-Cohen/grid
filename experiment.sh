cd habitus_ui_interface-main
python3 -m uvicorn --reload main2:app &

cd frontend
npm start
