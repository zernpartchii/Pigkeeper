<!-- Modal -->
<div class="modal fade" id="inventoryModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="itemTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="itemTitle">Add Expense</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="flex-column">
                    <div class="mb-3" id="pigIdDivDropdown">
                        <label for="pigIdDropdown" id="pigIdLabel" class="form-label d-none"></label>
                        <label for="pigIdDropdown" class="form-label">Select a Pig</label>
                        <select class="form-select" id="pigIdDropdown" aria-label="Default select example">

                        </select>
                    </div>
                    <div class="mb-3">
                       <div class="d-flex mb-3 align-items-center">
                            <label for="itemFeeds" class="form-label m-0">Item Name</label>
                            <button for="itemName" class="btn btn-sm ms-auto btn-secondary" id="btnCustom">Custom</button>
                       </div>
                        <input type="text" class="form-control d-none" id="itemName" placeholder="">
                        <select class="form-select" id="itemFeeds">
                            <option value="Immuno Booster" selected>Immuno Booster</option>
                            <option value="Super Start">Super Start</option>
                            <option value="Hog Starter">Hog Starter</option>
                            <option value="Hog Grower">Hog Grower</option>
                            <option value="Hog Finisher">Hog Finisher</option>
                            <option value="Hog Breeder">Hog Breeder</option>
                            <option value="Hog Gestating">Hog Gestating</option>
                            <option value="Hog Lactating">Hog Lactating</option>
                        </select>
                    </div> 
                    <script>
                            const itemFeeds = document.getElementById('itemFeeds');
                            const itemName = document.getElementById('itemName');
                            const btnCustom = document.getElementById('btnCustom');
                            btnCustom.addEventListener('click',()=>{
                                btnCustom.innerHTML = `${btnCustom.innerText === 'Custom'? 'Back':'Custom'}`;

                                if(btnCustom.innerText === 'Custom'){
                                    itemName.classList.add('d-none');
                                    itemFeeds.classList.remove('d-none');
                                }else{
                                    itemName.classList.remove('d-none');
                                    itemFeeds.classList.add('d-none');
                                }
                            });
                       </script>
                    <div class="mb-3" id="categoryContainer">
                        <label for="categoryExpense" class="form-label">Category</label>
                        <select class="form-select" id="categoryExpense">
                            <option value="Feed" selected>Feed</option>
                            <option value="Medicine">Medicine</option> 
                            <option value="Purchased">Purchased</option> 
                        </select>
                        <select class="form-select d-none" id="categoryIncome">
                            <option value="Livestock" selected>Livestock</option>
                            <option value="Service Income">Service Income</option>
                            <option value="Byproduct">Byproduct</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="qty" class="form-label">Qty</label>
                        <input type="text" class="form-control" id="qty" placeholder="">
                    </div>

                    <div class="mb-3">
                        <label for="price" class="form-label">Price</label>
                        <input type="text" class="form-control" id="price" placeholder="">
                    </div>

                    <div class="mb-3">
                        <label for="dateFinance" class="form-label">Date</label>
                        <input type="date" class="form-control" id="dateFinance" placeholder="">
                    </div>

                    <div class="mb-3">
                        <label for="financialNotes" class="form-label">Notes (Optional)</label>
                        <textarea type="text" class="form-control" id="financialNotes" placeholder=""></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <input type="hidden" class="form-control" id="itemID" placeholder="">
                <input type="hidden" class="form-control" id="categoryType" placeholder="">
                <button type="button" id="btnCloseItem" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" id="btnAddItem" class="btn btn-primary">Save</button>
                <button type="button" id="btnUpdateItem" class="btn btn-primary d-none">Save Changes</button>
            </div>
        </div>
    </div>
</div>