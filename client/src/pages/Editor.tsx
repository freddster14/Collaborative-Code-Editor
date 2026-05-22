import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Editor } from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { getRequest } from '../api/api-requests';
import generateDarkColor from '../utils/generateColor';
import type { editor } from 'monaco-editor';
import { Role } from '@cce/shared-types';

export default function Binding() {
  const user = useRouteLoaderData('user');
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [editor , setEditor] = useState<null | editor.IStandaloneCodeEditor>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null)
  const [binding, setBinding] = useState<MonacoBinding | null>(null)
  const [loading, setLoading] = useState(true)
  const { docId } = useParams();
  const navigate = useNavigate()

  // generate access token
  useEffect(() => {
    async function getToken() {
      try {
        const res = await getRequest(`/document/${docId}`)
        setToken(res.token)
        setRole(res.role)
      } catch (error) {
        console.error(error)
        navigate(-1)
      }
    }
    getToken();
  }, [])
  // lifetime for ydoc and provider
  useEffect(() => {
    if (!token) return;
    const provider = new HocuspocusProvider({
      url: import.meta.env.VITE_HOCUSPOCUS_URL,
      name: `document-${docId}`,
      document: ydoc,
      onAuthenticationFailed: () => {
        navigate(-1)
      },
      onSynced: () => {
        setLoading(false)
      },
      token
    });
    provider.awareness?.on("change", (c:{added:number[], removed:number[]}) => {
      const added = c.added;
      const removed = c.removed;
      const states = provider.awareness?.getStates();
      if(states)
      for(let i = 0; i < added.length; i++) {
        const styleTag = document.createElement('style');
        styleTag.id = `cursor-${added[i]}`
        const userStateFields = states.get(added[i]);
        if(userStateFields)
        styleTag.innerHTML = `
          .yRemoteSelectionHead-${added[i]} {
            border: 1px solid ${userStateFields.user.color};
          }
          .yRemoteSelectionHead-${added[i]}::after {
            content: "${userStateFields.user.name}";
            background-color: ${userStateFields.user.color};
            position: absolute;
            top: -15px;
            left: -2px;
            font-size: 10px;
            color: white;
            padding: 0 2px;
          }   
        `
        document.head.appendChild(styleTag)
      }
      for(let i = 0; i < removed.length; i++) {
        document.getElementById(`cursor-${removed[i]}`)?.remove()
      }
    })
   
    provider.awareness?.setLocalStateField('user', {
      name: user.username,
      color: generateDarkColor(),
    });
    setProvider(provider);
    return () => {
      provider?.destroy();
      ydoc.destroy();

      // Remove style tags
      const styleTags = document.querySelectorAll('[id^="cursor-"]')
      styleTags.forEach(e => { e.remove() });
    }
  }, [ydoc, token])


  // lifetime for editor binding
  useEffect(() => {
    if (provider === null || editor === null) return;
    const model = editor.getModel();
    if(model) {
      setLoading(false)
      const currBinding = new MonacoBinding(ydoc.getText(), model, new Set([editor]), provider.awareness);
      setBinding(currBinding)  
    }
    return () => {
      binding?.destroy();
    }
  }, [ydoc, provider, editor])

  return (
    <Editor
      height="90vh"
      defaultLanguage='javascript'
      theme='vs-dark'
      onMount={editor => { setEditor(editor)}}
      options={{
        readOnly: role === Role.VIEW || loading,
        domReadOnly: role === Role.VIEW || loading
      }}
    />
  )
}