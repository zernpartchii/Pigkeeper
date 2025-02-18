<!-- Modal -->
<div class="modal fade" id="dateDeceasedPigsowModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="DeceasedPigsowTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="DeceasedPigsowTitle">Deceased Pigsow</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="flex-column">
                    <!-- <input type="hidden" class="form-control" id="DeceasedPigID" placeholder=""> -->
                    <div class="mb-3">
                        <label for="dateDeceasedPigsow" class="form-label">Date Deceased</label>
                        <input type="date" class="form-control" id="dateDeceasedPigsow" placeholder="">
                    </div> 
                    <div class="mb-3">
                        <label for="DeceasedPigsowNotes" class="form-label">Notes (Optional)</label>
                        <textarea type="text" class="form-control" id="DeceasedPigsowNotes" placeholder=""></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="btnCloseDeceasedPigsowPigsow" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" id="btnDeceasedPigsow" class="btn btn-primary">Mark as Deceased</button>
            </div>
        </div>
    </div>
</div>