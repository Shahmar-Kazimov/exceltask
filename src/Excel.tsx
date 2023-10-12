import { useState } from "react"
import * as XLSX from "xlsx"

function Excel() {
    const [excelFile, setExcelFile] = useState("");
    const [typeError, setTypeError] = useState("");
    const [excelData, setExcelData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({})
    const [filteredData, setFilteredData] = useState<any[]>([])
    const [sortOrder, setSortOrder] = useState("asc");
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
                setExcelFile("")
            }
        }
        else {
            console.log("Please select your file")
        }
    }

    const handleFilterInputChange = (headerKey: string, value: string) => {
        var newFilters = { ...filters, [headerKey]: value }
        setFilters(newFilters)
        console.log(newFilters)

        var newFilteredData = excelData.filter(row => {
            var filterLogic: boolean = true
            Object.keys(newFilters).map((key) => {
                if (newFilters[key]) {
                    filterLogic = filterLogic && row && row[key] && ((row[key] + "").indexOf(newFilters[key] + "") > -1)
                }
            })
            console.log(filterLogic)
            return filterLogic
        })
        // check filters
        console.log("search result: ", newFilteredData.length)
        setFilteredData(newFilteredData)
    }

    const handleSort = (headerKey: any) => {
        const sortedData = filteredData.sort((a, b) => {
            if (sortOrder === "asc") {
                return a[headerKey] < b[headerKey] ? -1 : 1;
            } else {
                return a[headerKey] > b[headerKey] ? -1 : 1;
            }
        });
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        setFilteredData(sortedData);
    };

    const handleFileSubmit = (e: any) => {
        e.preventDefault();
        if (excelFile !== null) {
            const workbook = XLSX.read(excelFile, { type: "buffer" });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            var data: any[] = XLSX.utils.sheet_to_json(worksheet);
            var sortedData: any[] = data.sort((a, b) => (b.id || 0) - (a.id || 0))
            setExcelData(sortedData);
            setFilteredData(sortedData)
        }
    }

    const renderFilteredData = () => {
        console.log("render filtered data called")
        return filteredData.map((individualExcelData: any, index: any) => {
            return (
                <tr key={index}>
                    {Object.keys(individualExcelData).map((key) => (
                        <td key={key}>{individualExcelData[key]}</td>
                    ))}
                </tr>
            )
        })
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
                {filteredData ? (
                    <div className="table responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    {Object.keys(excelData && Array.isArray(excelData) && excelData.length > 0 ? excelData[0] : []).map((key, index) =>
                                        <th key={index}>
                                            {key}
                                            <button onClick={() => handleSort(key)}>
                                                {sortOrder === "asc" ? "▲" : "▼"}
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="ara"
                                                value={filters[key] || ""}
                                                name={key}
                                                onChange={(e) => handleFilterInputChange(key, e.target.value)} />
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {renderFilteredData()}
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