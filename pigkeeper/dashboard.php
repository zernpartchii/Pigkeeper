<div class="card m-3 p-3 bg-body">
    <h3>Dashboard</h3>
    <div class="d-flex flex-wrap gap-3 mb-3">

        <div class="d-flex flex-wrap gap-2 flex-fill border rounded">
            <!-- Piglets Card -->
            <div id="card" class="card flex-fill p-3 rounded-3">
                <div class="card d-flex align-items-center flex-row gap-3">
                   <!-- <div>
                        <img src="/images/piglets.svg" class="icon">
                    </div>   -->
                    <div class="flex-fill bg-success-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalPiglets">0</div>
                        <h6 class="text-uppercase text-center title">Piglets</h6> 
                    </div> 
                    <div class="flex-fill bg-primary-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalFattening">0</div>
                        <h6 class="text-uppercase text-center title">Fattening</h6> 
                    </div> 
                    <div class="flex-fill bg-danger-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalLetchon">0</div>
                        <h6 class="text-uppercase text-center title">Letchon</h6>  
                    </div> 
                </div>
            </div>

            
            <!-- Pigsow Card -->
            <div id="card" class="card flex-fill p-3 rounded-3">
                <div class="card d-flex align-items-center flex-row gap-3">
                    <!-- <div>
                        <img src="/images/pigsow.svg" alt="Pigsow Icon" class="icon">
                    </div> -->
                    <div class="flex-fill bg-secondary-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalPigsow">0</div>
                        <h6 class="text-uppercase text-center title">Pigsow</h6> 
                    </div>
                    <div class="flex-fill bg-warning-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalPigSold">0</div>
                        <h6 class="text-uppercase text-center title">Sold</h6> 
                    </div>
                    <div class="flex-fill bg-info-subtle rounded-3 p-2"> 
                        <div class="fw-medium text-center display-6 mb-2" id="totalPigDeceased">0</div>
                        <h6 class="text-uppercase text-center title">Deceased</h6> 
                    </div>
                </div>
            </div> 
        </div> 
    </div>

    <!-- Chart Section -->
    <div class="row g-3 mb-3">
        <!-- Bar Chart Card -->
        <div class="col-lg-9">
            <!-- <div class="text-end">
                <button class="btn btn-lg btn-danger bi-x-lg mb-3" id="btnX"></button>
            </div> -->
            <div id="environmentalChart" class="card border p-3" style="height: 400px;"></div>
        </div>
        <!-- Small Charts Section -->
        <div class="col-lg-3">
            <div class="card border p-3 h-100">
                <div class="card-header bg-body border-0">
                    <h6 class="text-center">Temperature Condition</h6>
                </div>
                <div class="card-body d-flex flex-column gap-3">
                    <div id="humidityChart" class="my-auto d-none" style="height: 250px;"></div>
                    <div id="temperatureChart" class="my-auto" style="height: 250px;"></div>
                    <!-- <button class="btn btn-lg btn-outline-secondary border-0 mt-auto" id="viewChart">View
                        Chart</button> -->
                </div>
            </div>
        </div>
    </div>

    <!-- Upcoming Events and Recent Activity Section -->
    <div class="row g-3 mb-3">
        <!-- Upcoming Events -->
        <div class="col-lg-6">
            <div class="card h-100 border">
                <div class="card-header bg-body">
                    <h6>Upcoming Task</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="upcomingTaskTable">
                            <thead>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- Recent Activity -->
        <div class="col-lg-6">
            <div class="card h-100 border">
                <div class="card-header bg-body">
                    <h6>Recent Activity</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="recentTaskTable">
                            <thead>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>