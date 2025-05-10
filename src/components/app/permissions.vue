<script setup lang="ts">
import { computed, inject, type Ref, ref } from "vue";
import { type RouteRecordRaw } from "vue-router";
import router from "@/router";
import { type TreeSelectionKeys } from "primevue";

// Interfaces for injected permissions and tree option
type DataInjectPermissions = {
    permission: Ref<any[]>,
    handleBlurPermissions: Function,
    checkAll: Ref<boolean>,
    keyValues: Ref<any[]>,
};

const keysSelected: Ref<TreeSelectionKeys> = ref({});
const useRoute = router;
const refPermissions = ref();
const keyValuesTree = ref();

const injectedPermissions = inject<DataInjectPermissions>("permissions", {} as DataInjectPermissions);
if ( !injectedPermissions) {
    throw new Error("dataPermissionsProvide is not available via provide");
}
const { checkAll, handleBlurPermissions, permission } = injectedPermissions;

/**
 * createOptionsTreeRoute
 *
 * Generates the tree option from the system routes.
 * Filters routes that have meta-information and recursively build an object with:
 * - key: constructed from the route name with prefixes if it's a child or a permission.
 * - label: derived from meta. Label or the route name.
 * - children: built recursively.
 * - class: taken from meta.icon.
 */
const createOptionsTreeRoute = computed(() => {
    const routesSystem = [
        ...useRoute.resolve({ name: "home" }).matched[0].children.filter((route: RouteRecordRaw) => route.meta)
    ];

    function createOptionsTree({ correctData, fatherNamePer, isChildren }: {
        correctData: any[];
        fatherNamePer?: string;
        isChildren?: boolean
    }) {
        return correctData.map(optionInfo => {
            const newOption: { key: string, label: string, children?: any[], class?: string } = { key: "", label: "" };

            // Process children recursively, if any
            if (optionInfo.children) {
                newOption.children = createOptionsTree({ correctData: optionInfo.children, isChildren: true });
            }
            // If meta.permissions exists, generate additional children for permissions
            if (optionInfo.meta?.permissions) {
                newOption.children = [
                    ...(newOption.children || []),
                    ...createOptionsTree({
                        correctData: optionInfo.meta.permissions,
                        fatherNamePer: `isPermission:${ optionInfo.name }`
                    })
                ];
            }
            newOption.key = optionInfo?.name || "";
            if (isChildren) newOption.key = `isChildren:%${ newOption.key }`;
            if (fatherNamePer) newOption.key = `${ fatherNamePer }%${ optionInfo.name }`;
            newOption.label = optionInfo.meta?.label || optionInfo.name;
            newOption.class = optionInfo.meta?.icon || undefined;

            return newOption;
        });
    }

    return createOptionsTree({ correctData: routesSystem });
});

// -----------------------------------------------------------------------------------
// Interfaces for permissions and tree option

export interface Permissions {
    name: string;
    permissions?: string[];
    children?: Permissions[];
    meta?: { permissions?: string[] };
}

export interface PermissionState {
    checked: boolean;
    partialChecked: boolean;
}

export interface TreeOptions {
    key: string;
    label: string;
    children?: Children[];
}

export interface Children {
    key: string;
    label: string;
    children?: Children[];
    checked?: boolean;
    partialChecked?: boolean;
}

// -----------------------------------------------------------------------------------
// flattenPermissionsTree
// Recursively walks through the permissions data and returns a flat object with all keys
// and their selection state (checked and partialChecked) calculated as follows:
// - If a node has no sub nodes (no permissions or children), it is marked as a leaf: { checked: true, partialChecked: false }.
// - If a node has sub nodes, its state is computed based on its sub nodes:
//    • If all sub nodes are fully checked, the node is { checked: true, partialChecked: false }.
//    • If some sub nodes are checked (or partially), the node is { checked: false, partialChecked: true }.
//    • Otherwise, the node is { checked: false, partialChecked: false }.
function flattenPermissionsTree(permissionsData: Permissions[]): Record<string, PermissionState> {
    const flat: Record<string, PermissionState> = {};

    const processNode = (node: Permissions, level: number = 0): PermissionState => {
        const childStates: PermissionState[] = [];

        // Process direct permissions (from meta.permissions or permissions)
        const nodePerms = node.meta?.permissions || node.permissions || [];
        if (nodePerms.length > 0) {
            nodePerms.forEach(perm => {
                const permKey = `isPermission:${ node.name }%${ perm }`;
                flat[permKey] = { checked: true, partialChecked: false };
                childStates.push({ checked: true, partialChecked: false });
            });
        }

        // Process children if any
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                const childState = processNode(child, level + 1);
                const childKey = `isChildren:%${ child.name }`;
                flat[childKey] = childState;
                childStates.push(childState);
            });
        }

        let state: PermissionState;
        if (childStates.length === 0) {
            state = { checked: true, partialChecked: false };
        } else {
            const allChecked = childStates.every(s => s.checked);
            const someChecked = childStates.some(s => s.checked || s.partialChecked);
            if (allChecked) {
                state = { checked: true, partialChecked: false };
            } else if (someChecked) {
                state = { checked: false, partialChecked: true };
            } else {
                state = { checked: false, partialChecked: false };
            }
        }
        const nodeKey = level === 0 ? node.name : `isChildren:%${ node.name }`;
        flat[nodeKey] = state;
        return state;
    };

    permissionsData.forEach(node => {
        processNode(node, 0);
    });

    return flat;
}

// -----------------------------------------------------------------------------------
// updateSelectionKeys
// Recursively traverses the option tree (from createOptionsTreeRoute) and recalculates the
// selection state of each node (both parent and child) based on the state of its children,
// emulating PrimeVue's selection propagation.
function updateSelectionKeys(flatKeys: Record<string, PermissionState>): Record<string, PermissionState> {
    const result: Record<string, PermissionState> = {};

    const processNode = (node: TreeOptions | Children): PermissionState => {
        if ("children" in node && node.children && node.children.length > 0) {
            const childrenStates = node.children.map(child => processNode(child));
            const allChecked = childrenStates.every(state => state.checked);
            const someChecked = childrenStates.some(state => state.checked || state.partialChecked);
            const state: PermissionState = allChecked ? { checked: true, partialChecked: false } : someChecked ?
                { checked: false, partialChecked: true } : { checked: false, partialChecked: false };
            result[node.key] = state;
            return state;
        } else {
            const state = flatKeys[node.key] ? flatKeys[node.key] : { checked: false, partialChecked: false };
            result[node.key] = state;
            return state;
        }
    };

    createOptionsTreeRoute.value.forEach(node => processNode(node));
    return result;
}

// -----------------------------------------------------------------------------------
// CheckAllPermissions
// Marks or unmarks all nodes in the option tree, updating keysSelected and the list of
// selected permissions accordingly.
const CheckAllPermissions = () => {
    const markAll = (nodes: any[]) => {
        nodes.forEach(node => {
            keysSelected.value[node.key] = { checked: true, partialChecked: false };
            if (node.children) markAll(node.children);
        });
    };
    if (checkAll.value) {
        keysSelected.value = {};
        markAll(createOptionsTreeRoute.value);
        permission.value = NewUserPermissions();
    } else {
        keysSelected.value = {};
        permission.value = [];
    }
};

// -----------------------------------------------------------------------------------
// NewUserPermissions
// Reconstructs the user permissions data to be sent. It traverses the option tree and
// filters only those nodes (or permissions) that are selected, regardless of the parent's state.
// For permission nodes, it extracts only the permission string (after the '%').
function NewUserPermissions(): any[] {
    function createNewOptionPermission(actualData: any[]): any[] {
        const newData: any[] = [];

        actualData.forEach((dataInfo: { key: string; children?: any[] }) => {
            let newObjInfo: { name: string; children?: any[]; permissions?: any[] } = {
                name: dataInfo.key
            };

            // If the node is a child, remove the "isChildren:" prefix to get the real name
            if (newObjInfo.name.includes("isChildren:")) newObjInfo.name = newObjInfo.name.split("%")[1];

            let childrenSelected: any[] = [];
            if (dataInfo.children) {
                // Filter children into nodes and permission nodes
                const childNodes = dataInfo.children.filter((childInfo: { key: string }) =>
                    childInfo.key.includes("isChildren:")
                );
                const permissionNodes = dataInfo.children.filter((childInfo: { key: string }) =>
                    childInfo.key.includes("isPermission:")
                );

                const newChildNodes = createNewOptionPermission(childNodes);
                const newPermissionNodes = createNewOptionPermission(permissionNodes);

                if (newChildNodes.length) newObjInfo.children = newChildNodes;
                if (newPermissionNodes.length) newObjInfo.permissions = newPermissionNodes;

                childrenSelected = [ ...newChildNodes, ...newPermissionNodes ];
            }

            const existKey = keysSelected.value[dataInfo.key]?.checked;
            // Include the node if either the node itself is selected or any of its children are
            if (existKey || childrenSelected.length > 0) {
                if (newObjInfo.name.includes("isPermission:")) {
                    newObjInfo.name = newObjInfo.name.split("%")[1];
                    newData.push(newObjInfo.name);
                } else {
                    newData.push(newObjInfo);
                }
            }
        });

        return newData;
    }

    return createNewOptionPermission(createOptionsTreeRoute.value);
}

// -----------------------------------------------------------------------------------
// Expose functions and variables for use in the template
defineExpose({ CheckAllPermissions, flattenPermissionsTree, keysSelected, keyValuesTree, updateSelectionKeys });

</script>

<template>
    <Tree v-model:value="createOptionsTreeRoute" selection-mode="checkbox" filter-mode="strict" filter ref="refPermissions"
          v-model="permission" v-bind="handleBlurPermissions" @node-select="() => { permission = NewUserPermissions() }"
          v-model:selection-keys="keysSelected" @node-unselect="() => { permission = NewUserPermissions() }">
        <template #nodeicon="{ node }">
            <component :is="node.class"/>
        </template>
    </Tree>
</template>
