'use client';

import PageTitle from '@/components/PageTitle';
import Modal from '@/components/Modal';
import AddTaskForm from '@/components/AddTaskForm';
import { useState, useEffect } from 'react';
import { taskService, Task, TaskQueryParams } from '@/lib/tasks-api';

interface PaginationMeta {
  current_page: number;
  from?: number;
  last_page: number;
  per_page: number;
  to?: number;
  total: number;
}

type StatusFilter = 'all' | 'pending' | 'done' | 'inProgress';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchTasks = async (page: number = 1, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: TaskQueryParams = {
        page,
        per_page: perPage,
      };

      if (status && status !== 'all') {
        params.status = status as 'pending' | 'inProgress' | 'done';
      }
      
      const { tasks: taskList, meta, error: fetchError } = await taskService.fetchTasks(params);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      setTasks(taskList || []);
      if (meta) {
        setPagination(meta);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'done' | 'inProgress') => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchTasks(currentPage, filter);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    fetchTasks(1, filter); // Fetch immediately with new per_page value
  };

  const handleTaskCreated = (task: Task) => {
    // Close modal
    setIsAddModalOpen(false);
    
    // If we're on the first page and showing all tasks or the same status, refresh current page
    // Otherwise, go to first page to see the new task
    if (currentPage === 1 && (filter === 'all' || filter === task.status)) {
      fetchTasks(1, filter);
    } else {
      setCurrentPage(1);
      setFilter(task.status as StatusFilter);
    }
  };

  const handleTaskError = (error: string) => {
    setError(error);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setError(null);
      const { error: deleteError } = await taskService.deleteTask(taskId);
      
      if (deleteError) {
        setError(deleteError);
      } else {
        // Refresh current page
        await fetchTasks(currentPage, filter);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the task');
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      setError(null);
      const newStatus = task.status === 'done' ? 'pending' : (task.status === 'inProgress' ? 'done' : 'inProgress');
      const { error: updateError } = await taskService.updateTask(task.id, { status: newStatus });

      if (updateError) {
        setError(updateError);
      } else {
        // Refresh current page
        await fetchTasks(currentPage, filter);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the task');
      console.error('Error updating task:', err);
    }
  };

  const handleOpenAddModal = () => {
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inProgress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return '✅';
      case 'inProgress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchTasks(currentPage, filter);
  }, [currentPage, filter, perPage]);

  const PageTitleSection = (
    <PageTitle
      title="Tasks"
      subtitle="Manage and track all your tasks in one place."
      button
      buttonText="Add Task"
      buttonHandler={handleOpenAddModal}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {PageTitleSection}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {PageTitleSection}

        {/* Filter Buttons and Per Page Selector */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'inProgress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? 'All Tasks' : 
                 status === 'inProgress' ? 'In Progress' :
                 status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="per-page" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show:
            </label>
            <select
              id="per-page"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="block px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-400"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Pagination Info and Refresh Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {pagination ? (
              <>Page {pagination.current_page} of {pagination.last_page} pages - Showing {pagination.per_page} tasks per page</>
            ) : (
              <>Showing {tasks.length} tasks</>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                Refresh List
              </>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading tasks
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRefresh}
                    className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm font-bold"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No tasks found' : `No ${filter === 'inProgress' ? 'in progress' : filter} tasks`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'Get started by creating your first task.' 
                : `There are no ${filter === 'inProgress' ? 'in progress' : filter} tasks at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-1 border-gray-100 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getStatusIcon(task.status)}</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300 ml-8">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400 ml-8">
                        <span title={formatDate(task.created_at)}>Created: {task.created_at_human}</span>
                        {task.updated_at !== task.created_at && (
                          <span className="ml-4" title={formatDate(task.updated_at)}>Updated: {task.updated_at_human}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status_label}
                      </span>
                      <div className="flex space-x-3 pt-1">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className="cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          title={task.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                        >
                          {task.status === 'done' ? 'Undo' : (task.status === 'inProgress' ? 'Complete' : 'Start task' )}
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="cursor-pointer text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Page <span className="font-medium">{pagination.current_page}</span> of{' '}
                  <span className="font-medium">{pagination.last_page}</span>
                  {' '} - {' '}
                  (<span className="font-medium">{pagination.total}</span> total results)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    let pageNumber;
                    if (pagination.last_page <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= pagination.last_page - 2) {
                      pageNumber = pagination.last_page - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`cursor-pointer relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add New Task">
        <AddTaskForm
          onSubmit={handleTaskCreated}
          onCancel={handleCloseAddModal}
          onError={handleTaskError}
        />
      </Modal>
    </div>
  );
}
