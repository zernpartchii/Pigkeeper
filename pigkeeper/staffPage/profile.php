<div class="card d-flex align-items-center gap-3 p-3" style="min-height: 65vh;">
    <div class="profile" id="staffProfileInfo">
        <h1 id="staffProfileName"></h1>
    </div>
    <div class="d-flex flex-column credentials">
        <div class="d-flex">
            <input type="text" id="staffProfileUsername" readonly class="border-0 fs-3" style="width: 400px;">
            <button type="button" id="btnStaffEditSave"
                class="btn btn-outline-light fs-2 border-0 bi-pencil-square text-dark"></button>
        </div>
        <input type="text" id="staffProfileID" readonly class="border-0 text-muted">
        <input type="text" id="staffProfileEmail" readonly class="border-0 text-muted">
        <button type="button" class="btn btn-secondary mt-3" data-bs-toggle="modal" data-bs-target="#changePass">
            Change Password
        </button>
    </div>
</div>