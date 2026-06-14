const Transaction = () => {
    return (
        <div className="d-flex flex-column flex-shrink-0 bg-white border rounded mb-4 p-3 mx-auto" 
            style={{ width: '21vw', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
            <select className="form-select bg-light p-1 ps-3">
                <option selected>Prepa1</option>
                <option value="2">Prepa2</option>
                <option value="3">Prepa3</option>
            </select>
            <div>
                <div className="mt-1 p-2" >
                    <div className="" >
                        <button className="btn btn-warning btn-sm pt-0 pb-0 text-white w-100" >Imprimer le reçu</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Transaction;