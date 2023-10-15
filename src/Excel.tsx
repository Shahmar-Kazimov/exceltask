import { useState } from "react"
import * as XLSX from "xlsx"
import Modal from 'react-modal';
import { ToastContainer, } from 'react-toastify';


function Excel() {
    const [excelFile, setExcelFile] = useState("");
    const [typeError, setTypeError] = useState("");
    const [excelData, setExcelData] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({})
    const [filteredData, setFilteredData] = useState<any[]>([])
    const [sortOrder, setSortOrder] = useState("asc");
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [newData, setNewData] = useState({ id: "", len: "", wkt: "", status: "" });
    const [editData, setEditData] = useState<any | null>(null);
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
                    <td className="text-nowrap">
                        <button className="btn btn-primary m-1" onClick={() => handleEdit(individualExcelData)}>Edit</button>
                        <button className="btn btn-danger m-1" onClick={() => handleRemove(individualExcelData)}>Remove</button>
                        <button type="button" className="btn btn-warning m-1 text-nowrap">SHOW IN MAP</button>

                    </td>
                </tr>
            )
        })

    }

    const handleSubmitCreate = () => {
        const lastId = excelData.length > 0 ? excelData[0].id : 0;
        const newId = lastId + 1;
        setExcelData((excelData) => [{ ...newData, id: newId }, ...excelData]);
        setFilteredData((prevFilteredData) => [{ ...newData, id: newId }, ...prevFilteredData]);
        setNewData({ id: "", len: "", wkt: "", status: "" });
        setCreateModalOpen(false);
    };

    const handleEdit = (rowData: any) => {
        setEditData(rowData);
        setEditModalOpen(true);
    };

    const handleSubmitEdit = () => {
        const dataIndex = excelData.findIndex((data) => data.id === editData.id);
        const updatedData = [...excelData];
        updatedData[dataIndex] = { ...editData };
        setExcelData(updatedData);
        setFilteredData(updatedData);
        setEditData(null);
        setEditModalOpen(false);
    };

    const handleRemove = (rowData: any) => {
        const updatedData = excelData.filter((data) => data.id !== rowData.id);
        setExcelData(updatedData);
        setFilteredData(updatedData);
    }

    return (
        <div className="wrapper">
            <h3>Upload & View Excel Sheets</h3>
            <form className="form-group custom-form" onSubmit={handleFileSubmit}>
                <input type="file" className="form-control" required onChange={handleFile} /><br />
                <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
                <button type="button" onClick={() => setCreateModalOpen(true)} className="btn btn-success btn-md m-2">ADD NEW</button>
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
                                            <button className="btn btn-sm" onClick={() => handleSort(key)}>
                                                {sortOrder === "asc" ? "▲" : "▼"}
                                            </button>
                                            <br />
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
            <Modal
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.75)'
                    },
                    content: {
                        position: 'absolute',
                        top: '30px',
                        left: '25%',
                        right: '25%',
                        bottom: '340px',
                        border: '2px solid black',
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px'
                    }
                }}
                isOpen={createModalOpen} className='modal-dialog modal-style'>

                <div className='modal-content p-3'>
                    <div>
                        <div className="modal-header">
                            <h5 className="modal-title">Create</h5>
                            <button type="button" onClick={() => { setCreateModalOpen(false) }} className='btn btn-outline-dark' > X </button>
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            <div>
                                <label htmlFor="len">Len : </label>
                                <input
                                    type="text"
                                    name="len"
                                    required={true}
                                    style={{ width: "100%" }}
                                    value={newData.len}
                                    onChange={e => setNewData({ ...newData, len: e.target.value })} />
                            </div>
                            <div>
                                <label htmlFor="status">Status : </label>
                                <input
                                    type="number"
                                    name="wkt"
                                    required={true}
                                    style={{ width: "100%" }}
                                    value={newData.status}
                                    onChange={e => setNewData({ ...newData, status: e.target.value })} />
                            </div>
                            <br />
                            <button type="submit" className='btn btn-outline-success m-2'>Create</button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Modal
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.75)'
                    },
                    content: {
                        position: 'absolute',
                        top: '30px',
                        left: '25%',
                        right: '25%',
                        bottom: '340px',
                        border: '2px solid black',
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px'
                    }
                }}
                isOpen={editModalOpen} role="document" className='modal-dialog '>
                {editData ? (
                    <div className='modal-content p-3'>
                        <div className="modal-header">
                            <h5 className="modal-title">Edit</h5>
                            <button type="button" onClick={() => { setEditModalOpen(false) }} className='btn btn-outline-dark' > X </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <div>
                                <label htmlFor="len">Len : </label>
                                <input
                                    type="text"
                                    name="len"
                                    required={true}
                                    style={{ width: "100%" }}
                                    value={editData.len}
                                    onChange={(e) => setEditData({ ...editData, len: e.target.value })} />
                            </div>
                            <div>
                                <label htmlFor="wkt">Status : </label>
                                <input
                                    type="text"
                                    name="wkt"
                                    required={true}
                                    style={{ width: "100%" }}
                                    value={editData.wkt}
                                    onChange={(e) => setEditData({ ...editData, wkt: e.target.value })} />
                            </div>
                            <br />
                            <button type="submit" className='btn btn-outline-success m-2'>Save Changes</button>
                        </form>
                    </div>
                ) : null}
            </Modal>
            <ToastContainer />
        </div>
    )
}

export default Excel