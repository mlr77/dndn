# app/jupyter.py
import asyncio
import json
from typing import Dict, List, Any
import jupyter_client
from jupyter_client.manager import KernelManager

class JupyterClient:
    def __init__(self):
        # Start a kernel
        self.kernel_manager = KernelManager()
        self.kernel_manager.start_kernel()
        self.kernel_client = self.kernel_manager.client()
        self.kernel_client.start_channels()

        # Ensure the kernel is ready
        self.kernel_client.wait_for_ready()

    async def execute_code(self, code: str) -> List[Dict[str, Any]]:
        """Execute code and return outputs"""
        if not code.strip():
            return []

        # Send the code to the kernel
        msg_id = self.kernel_client.execute(code)

        # Collect outputs
        outputs = []
        done = False

        while not done:
            try:
                msg = self.kernel_client.get_iopub_msg(timeout=10)
                msg_type = msg['header']['msg_type']
                content = msg['content']

                if msg_type == 'stream':
                    outputs.append({
                        'output_type': 'stream',
                        'name': content['name'],
                        'text': content['text']
                    })
                elif msg_type == 'display_data':
                    outputs.append({
                        'output_type': 'display_data',
                        'data': content['data'],
                        'metadata': content.get('metadata', {})
                    })
                elif msg_type == 'execute_result':
                    outputs.append({
                        'output_type': 'execute_result',
                        'data': content['data'],
                        'metadata': content.get('metadata', {}),
                        'execution_count': content['execution_count']
                    })
                elif msg_type == 'error':
                    outputs.append({
                        'output_type': 'error',
                        'ename': content['ename'],
                        'evalue': content['evalue'],
                        'traceback': content['traceback']
                    })
                elif msg_type == 'status' and content['execution_state'] == 'idle':
                    # Execution is complete
                    if msg['parent_header']['msg_id'] == msg_id:
                        done = True
            except:
                # Timeout or other error
                break

        return outputs

    def __del__(self):
        """Cleanup when the object is destroyed"""
        if hasattr(self, 'kernel_client'):
            self.kernel_client.stop_channels()
        if hasattr(self, 'kernel_manager'):
            self.kernel_manager.shutdown_kernel()