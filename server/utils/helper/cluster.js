import os from "os";
 
function startCluster(appCallback, clusterObj) {
  if (clusterObj.isMaster) {
    // If it's the master process, fork workers
    for (let i = 0; i < os.cpus().length; i++) {
      clusterObj.fork();
    }

    // Listen for dying workers and fork a new one
    clusterObj.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      clusterObj.fork(); // Fork a new worker
    });
  } else {
    // Set the worker ID in the cluster object based on the worker's index
    if (clusterObj.worker.id > 8) {
      clusterObj.worker.id = null;
    }
    clusterObj.worker.id =
      clusterObj.worker.id || clusterObj.worker.id === 0
        ? clusterObj.worker.id
        : clusterObj.workers[clusterObj.worker.id - 1].id;

    // Invoke the callback function to start the application logic
    try {
      appCallback(clusterObj);
    } catch (error) {
      console.error("Error in appCallback:", error);
    }
  }
}

export default startCluster;
