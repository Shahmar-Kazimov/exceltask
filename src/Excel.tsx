import { useState } from "react"
import * as XLSX from "xlsx"
function Excel() {
    const [excelFile, setExcelFile] = useState(null);
    const [typeError, setTypeError] = useState("");
    const [excelData, setExcelData] = useState([]);
    const handleFile = (e: any) => {
        let fileTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile && fileTypes.includes(selectedFile.type)) {
                setTypeError("");
                let reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = (e: any) => {
                    setExcelFile(e.target.result);
                }
            }
            else {
                setTypeError("Please select only excel file types")
                setExcelFile(null)
            }
        }
        else {
            console.log("Please select your file")
        }
    }

    const handleFileSubmit = (e: any) => {
        e.preventDefault();
        if (excelFile !== null) {
            const workbook = XLSX.read(excelFile, { type: "buffer" });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            var data: never[] = XLSX.utils.sheet_to_json(worksheet);
            setExcelData(data.sort((a: { id: number }, b: { id: number }) => b.id - a.id));
        }
    }

    return (
        <div className="wrapper">
            <h3>Upload & View Excel Sheets</h3>
            <form className="form-group custom-form" onSubmit={handleFileSubmit}>
                <input type="file" className="form-control" required onChange={handleFile} /><br />
                <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
                {typeError && (
                    <div className="alert alert-danger" role="alert">{typeError}</div>
                )}
            </form><br />
            <div>
                {excelData ? (
                    <div className="table responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    {Object.keys(excelData && Array.isArray(excelData) && excelData.length > 0 ? excelData[0] : []).map((key, index) =>
                                        <th key={index}>
                                            {key}
                                            <input type="text" placeholder="ara" />
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {excelData.map((individualExcelData: any, index: any) => (
                                    <tr key={index}>
                                        {Object.keys(individualExcelData).map((key) => (
                                            <td key={key}>{individualExcelData[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>No File is uploaded yet!</div>
                )}
            </div>

        </div>
    )
}

export default Excel