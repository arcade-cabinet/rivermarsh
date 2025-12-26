import { GyroscopeCamera as StrataGyroCamera } from '@jbcom/strata';
import * as THREE from 'three';
import { useControlsStore } from '@/stores/controlsStore';
import { useRPGStore } from '@/stores/rpgStore';

export function GyroscopeCamera() {
    const playerPosition = useRPGStore((state) => state.player.position);
    const setCameraAzimuth = useControlsStore((state) => state.setCameraAzimuth);
    const targetPos = new THREE.Vector3(...playerPosition);

    return (
        <StrataGyroCamera
            target={targetPos}
            distance={15}
            minDistance={5}
            maxDistance={30}
            onAzimuthChange={setCameraAzimuth}
        />
    );
}
