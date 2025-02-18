<div class="card m-3 p-3 bg-body">
    <div class="card-header d-flex justify-content-between border-0 bg-transparent">
        <div class="d-flex align-items-center justify-content-between flex-fill">
            <div>
                <h3 class="m-0">Analytics</h3>
            </div>
            <div class="d-flex gap-2">
                <div class="card px-2" style="background-color: #66CDAA;">Piglets</div>
                <div class="card px-2" style="background-color: #87CEFA;">Fattening</div>
                <div class="card px-2" style="background-color: #CD5C5C;">Letchon</div>
                <div class="card px-2" style="background-color: #C0C0C0;">Pigsow</div>
            </div>
        </div>
        <select class="form-select form-select-sm w-auto d-none" id="selectedYearProfitLoss"
            aria-label="Year selection">

        </select>
        <select id="yearFilter" class="form-select w-auto d-none">
            <option value="all">All Years</option>
        </select>
    </div>
    <div id="netProfitChart" style="height: 500px;" class="d-none"></div>
    <!-- Skeleton Loading -->
    <div id="chartSkeleton" class="skeleton-container">
        <div class="skeleton-title"></div>
        <div class="skeleton-bars">
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
        </div>
    </div>

    <style>
    .skeleton-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background: #f6f7f8;
        border-radius: 10px;
        height: 45rem;
        justify-content: center;
    }

    .skeleton-title {
        width: 50%;
        height: 20px;
        background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .skeleton-bars {
        display: flex;
        align-items: flex-end;
        gap: 50px;
        width: 100%;
        height: 1000rem;
        justify-content: center;
    }

    .skeleton-bar {
        width: 150px;
        height: 100%;
        background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 4px;
    }

    .skeleton-bar:nth-child(1) {
        height: 40%;
    }

    .skeleton-bar:nth-child(2) {
        height: 60%;
    }

    .skeleton-bar:nth-child(3) {
        height: 80%;
    }

    .skeleton-bar:nth-child(4) {
        height: 70%;
    }

    .skeleton-bar:nth-child(5) {
        height: 90%;
    }

    .skeleton-bar:nth-child(6) {
        height: 50%;
    }

    .skeleton-bar:nth-child(7) {
        height: 65%;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }

        100% {
            background-position: 200% 0;
        }
    }
    </style>
    <div class="d-flex align-items-center flex-row m-3 gap-3 d-none" id="filterByPigIDContainer">
        <label for="filterByPigID" class="form-label">Filter by: </label>
        <select class="form-select " id="filterByPigID" style="width: 300px;">

        </select>
    </div>

    <div class="d-flex flex-column" id="analyticsData">
        <div class="card w-100" id="templateAnalytics">

        </div>
    </div>
</div>